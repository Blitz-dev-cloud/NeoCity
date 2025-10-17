// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./DeFiToken.sol";
import "./IdentityRegistry.sol";

contract DeFiBank is Ownable, ReentrancyGuard, Pausable {
    DeFiToken public neoToken;
    IdentityRegistry public identityRegistry;
    
    struct Deposit {
        uint256 amount;
        uint256 timestamp;
        uint256 interestRate;
    }
    
    struct Loan {
        uint256 amount;
        uint256 collateral;
        uint256 interestRate;
        uint256 timestamp;
        uint256 dueDate;
        bool isActive;
        bool isApproved;
    }
    
    mapping(address => Deposit) public deposits;
    mapping(address => Loan[]) public loans;
    mapping(address => uint256) public totalLoaned;
    
    uint256 public constant DEFAULT_INTEREST_RATE = 500;
    uint256 public constant LOAN_DURATION = 365 days;
    uint256 public constant COLLATERAL_RATIO = 150;
    
    event DepositMade(address indexed user, uint256 amount, uint256 timestamp);
    event WithdrawalMade(address indexed user, uint256 amount, uint256 timestamp);
    event LoanRequested(address indexed borrower, uint256 amount, uint256 collateral, uint256 loanId);
    event LoanApproved(address indexed borrower, uint256 loanId);
    event LoanRepaid(address indexed borrower, uint256 loanId, uint256 amount);
    
    constructor(address _neoToken, address _identityRegistry) Ownable(msg.sender) {
        neoToken = DeFiToken(_neoToken);
        identityRegistry = IdentityRegistry(_identityRegistry);
    }
    
    function deposit(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(neoToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        if (deposits[msg.sender].amount > 0) {
            uint256 interest = calculateInterest(msg.sender);
            deposits[msg.sender].amount += interest;
        }
        
        deposits[msg.sender].amount += amount;
        deposits[msg.sender].timestamp = block.timestamp;
        deposits[msg.sender].interestRate = DEFAULT_INTEREST_RATE;
        
        emit DepositMade(msg.sender, amount, block.timestamp);
    }
    
    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(deposits[msg.sender].amount >= amount, "Insufficient balance");
        
        uint256 interest = calculateInterest(msg.sender);
        deposits[msg.sender].amount += interest;
        deposits[msg.sender].timestamp = block.timestamp;
        
        require(deposits[msg.sender].amount >= amount, "Insufficient balance after interest");
        
        deposits[msg.sender].amount -= amount;
        require(neoToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit WithdrawalMade(msg.sender, amount, block.timestamp);
    }
    
    function requestLoan(uint256 amount, uint256 collateralAmount) external nonReentrant whenNotPaused {
        require(amount > 0, "Loan amount must be greater than 0");
        require(collateralAmount >= (amount * COLLATERAL_RATIO) / 100, "Insufficient collateral");
        require(neoToken.transferFrom(msg.sender, address(this), collateralAmount), "Collateral transfer failed");
        
        loans[msg.sender].push(Loan({
            amount: amount,
            collateral: collateralAmount,
            interestRate: DEFAULT_INTEREST_RATE,
            timestamp: block.timestamp,
            dueDate: block.timestamp + LOAN_DURATION,
            isActive: true,
            isApproved: false
        }));
        
        uint256 loanId = loans[msg.sender].length - 1;
        emit LoanRequested(msg.sender, amount, collateralAmount, loanId);
    }
    
    function approveLoan(address borrower, uint256 loanId) external onlyOwner {
        require(loanId < loans[borrower].length, "Invalid loan ID");
        require(loans[borrower][loanId].isActive, "Loan not active");
        require(!loans[borrower][loanId].isApproved, "Loan already approved");
        
        loans[borrower][loanId].isApproved = true;
        totalLoaned[borrower] += loans[borrower][loanId].amount;
        
        require(neoToken.transfer(borrower, loans[borrower][loanId].amount), "Loan transfer failed");
        
        emit LoanApproved(borrower, loanId);
    }
    
    function repayLoan(uint256 loanId) external nonReentrant whenNotPaused {
        require(loanId < loans[msg.sender].length, "Invalid loan ID");
        require(loans[msg.sender][loanId].isActive, "Loan not active");
        require(loans[msg.sender][loanId].isApproved, "Loan not approved");
        
        uint256 interest = calculateLoanInterest(msg.sender, loanId);
        uint256 totalRepayment = loans[msg.sender][loanId].amount + interest;
        
        require(neoToken.transferFrom(msg.sender, address(this), totalRepayment), "Repayment failed");
        
        require(neoToken.transfer(msg.sender, loans[msg.sender][loanId].collateral), "Collateral return failed");
        
        loans[msg.sender][loanId].isActive = false;
        totalLoaned[msg.sender] -= loans[msg.sender][loanId].amount;
        
        emit LoanRepaid(msg.sender, loanId, totalRepayment);
    }
    
    function calculateInterest(address user) public view returns (uint256) {
        if (deposits[user].amount == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - deposits[user].timestamp;
        uint256 annualInterest = (deposits[user].amount * deposits[user].interestRate) / 10000;
        return (annualInterest * timeElapsed) / 365 days;
    }
    
    function calculateLoanInterest(address borrower, uint256 loanId) public view returns (uint256) {
        if (loanId >= loans[borrower].length) return 0;
        
        Loan storage loan = loans[borrower][loanId];
        uint256 timeElapsed = block.timestamp - loan.timestamp;
        uint256 annualInterest = (loan.amount * loan.interestRate) / 10000;
        return (annualInterest * timeElapsed) / 365 days;
    }
    
    function getDeposit(address user) external view returns (uint256 amount, uint256 timestamp, uint256 interestRate) {
        return (deposits[user].amount, deposits[user].timestamp, deposits[user].interestRate);
    }
    
    function getLoanCount(address borrower) external view returns (uint256) {
        return loans[borrower].length;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}
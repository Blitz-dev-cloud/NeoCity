// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./IdentityRegistry.sol";

contract Voting is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    IdentityRegistry public identityRegistry;
    
    enum ProposalStatus { Pending, Active, Passed, Failed, Executed }
    
    struct Proposal {
        uint256 id;
        string title;
        string description;
        address proposer;
        uint256 startTime;
        uint256 endTime;
        uint256 yesVotes;
        uint256 noVotes;
        ProposalStatus status;
        mapping(string => bool) hasVoted;
        mapping(address => bool) hasVotedByAddress; // For simple voting
    }
    
    struct Vote {
        bytes32 commitHash;
        bool revealed;
        bool vote;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(string => Vote)) public votes;
    
    uint256 public proposalCount;
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant REVEAL_PERIOD = 2 days;
    
    event ProposalCreated(uint256 indexed proposalId, string title, address indexed proposer, uint256 endTime);
    event VoteCommitted(uint256 indexed proposalId, string indexed did, uint256 timestamp);
    event VoteRevealed(uint256 indexed proposalId, string indexed did, bool vote, uint256 timestamp);
    event ProposalExecuted(uint256 indexed proposalId, bool passed, uint256 yesVotes, uint256 noVotes);
    
    constructor(address _identityRegistry) {
        identityRegistry = IdentityRegistry(_identityRegistry);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    // Updated modifier
    modifier onlyValidDID(string memory did) {
        require(identityRegistry.verifyIdentity(did), "Invalid or inactive DID");
        require(identityRegistry.getIdentityOwner(did) == msg.sender, "Not DID owner");
        _;
    }
    
    function createProposal(
        string memory did,
        string memory title, 
        string memory description
    ) external onlyValidDID(did) returns (uint256) {
        proposalCount++;
        
        Proposal storage newProposal = proposals[proposalCount];
        newProposal.id = proposalCount;
        newProposal.title = title;
        newProposal.description = description;
        newProposal.proposer = msg.sender;
        newProposal.startTime = block.timestamp;
        newProposal.endTime = block.timestamp + VOTING_PERIOD;
        newProposal.status = ProposalStatus.Active;
        
        emit ProposalCreated(proposalCount, title, msg.sender, newProposal.endTime);
        return proposalCount;
    }
    
    function commitVote(
        uint256 proposalId, 
        string memory did, 
        bytes32 commitHash
    ) external onlyValidDID(did) {
        require(proposalId <= proposalCount, "Invalid proposal ID");
        require(block.timestamp <= proposals[proposalId].endTime, "Voting period ended");
        require(!proposals[proposalId].hasVoted[did], "Already voted");
        require(proposals[proposalId].status == ProposalStatus.Active, "Proposal not active");
        
        votes[proposalId][did].commitHash = commitHash;
        proposals[proposalId].hasVoted[did] = true;
        
        emit VoteCommitted(proposalId, did, block.timestamp);
    }
    
    function revealVote(
        uint256 proposalId,
        string memory did,
        bool voteChoice,
        uint256 nonce
    ) external onlyValidDID(did) {
        require(proposalId <= proposalCount, "Invalid proposal ID");
        require(block.timestamp > proposals[proposalId].endTime, "Voting period not ended");
        require(block.timestamp <= proposals[proposalId].endTime + REVEAL_PERIOD, "Reveal period ended");
        require(proposals[proposalId].hasVoted[did], "No vote committed");
        require(!votes[proposalId][did].revealed, "Vote already revealed");
        
        bytes32 hash = keccak256(abi.encodePacked(voteChoice, nonce));
        require(hash == votes[proposalId][did].commitHash, "Invalid reveal");
        
        votes[proposalId][did].revealed = true;
        votes[proposalId][did].vote = voteChoice;
        
        if (voteChoice) {
            proposals[proposalId].yesVotes++;
        } else {
            proposals[proposalId].noVotes++;
        }
        
        emit VoteRevealed(proposalId, did, voteChoice, block.timestamp);
    }
    
    // Simple vote function for demo purposes (bypasses commit-reveal)
    // Gas optimized - uses address instead of DID string lookup
    function vote(uint256 proposalId, bool support) external {
        require(proposalId <= proposalCount, "Invalid proposal ID");
        require(block.timestamp <= proposals[proposalId].endTime, "Voting period ended");
        require(proposals[proposalId].status == ProposalStatus.Active, "Proposal not active");
        require(!proposals[proposalId].hasVotedByAddress[msg.sender], "Already voted");
        
        proposals[proposalId].hasVotedByAddress[msg.sender] = true;
        
        if (support) {
            proposals[proposalId].yesVotes++;
        } else {
            proposals[proposalId].noVotes++;
        }
        
        // Emit with empty DID for gas savings
        emit VoteRevealed(proposalId, "", support, block.timestamp);
    }
    
    function executeProposal(uint256 proposalId) external {
        require(proposalId <= proposalCount, "Invalid proposal ID");
        require(block.timestamp > proposals[proposalId].endTime + REVEAL_PERIOD, "Reveal period not ended");
        require(proposals[proposalId].status == ProposalStatus.Active, "Proposal not active");
        
        bool passed = proposals[proposalId].yesVotes > proposals[proposalId].noVotes;
        proposals[proposalId].status = passed ? ProposalStatus.Passed : ProposalStatus.Failed;
        
        emit ProposalExecuted(proposalId, passed, proposals[proposalId].yesVotes, proposals[proposalId].noVotes);
    }
    
    function getProposal(uint256 proposalId) external view returns (
        uint256 id,
        string memory title,
        string memory description,
        address proposer,
        uint256 startTime,
        uint256 endTime,
        uint256 yesVotes,
        uint256 noVotes,
        ProposalStatus status
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.id,
            proposal.title,
            proposal.description,
            proposal.proposer,
            proposal.startTime,
            proposal.endTime,
            proposal.yesVotes,
            proposal.noVotes,
            proposal.status
        );
    }
}

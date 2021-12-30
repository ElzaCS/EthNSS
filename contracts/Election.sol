pragma solidity ^0.5.0;

contract Election {
    // Model a Candidate
    struct Candidate {
        uint id;
        string name;
        string dept; // used as location
        string roll; // used as target
        string fileLoc;
        string fileHash;
        address accAddress;
        uint noVotes;
    }

    // Store accounts that have voted
    mapping(address => bool) public voters;

    // Store Candidates
    // Fetch Candidate
    mapping(uint => Candidate) public candidates;
    
    // Store Candidates Count
    uint public candidatesCount;

    // voted event
    event votedEvent (
        uint indexed _candidateId
    );

    event addedCandidate (
        uint indexed _candidateId
    );

    address payable public caller;

    constructor() public {
        caller = caller = msg.sender;

        // Replace sampleAddr in each location with required account address
        address sampleAddr = msg.sender;
        addCandidate("The Voice of the Martyrs", "U.S.A.", "Minority Religions", "./files/TheVoice.txt", "665145069", sampleAddr);
        
        //addCandidate("Jivdaya Charitable Trust", "Gujarat", "Animal care", "./files/Jivdaya.txt", "-139417957", sampleAddr);
        //addCandidate("Mitti Cafe", "Asia-Pacific", "Person with Disability", "./files/Mitti.txt", "694526058", sampleAddr);
        //addCandidate("Salahuddin Ayyubi Foundation", "Rajasthan", "Health care", "./files/Salahuddin.txt", "-1726948915", sampleAddr);
        //addCandidate("Bala Vikasa International Center", "Andhra Pradesh", "Social Entrepreneurship", "./files/Bala.txt", "-243014348", sampleAddr);
        //addCandidate("Annamrita Foundation", "Maharashtra", "Rural Children", "./files/Annamrita.txt", "1019967638", sampleAddr);
        //addCandidate("Educate Girls", "U.S.A.", "Girls Education", "./files/Educate.txt", "651909930", sampleAddr);
    }

    //function () external payable {}

    function addCandidate (string memory _name, string memory _dept, string memory _roll, string memory _fileLoc, string memory _fileHash, address _accAddr) public {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, _dept, _roll, _fileLoc, _fileHash, _accAddr, 100);
        emit addedCandidate(candidatesCount);
    }

    function vote (uint _candidateId, uint _update) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        if (_update == 0){   
            voters[msg.sender] = true;
            candidates[_candidateId].noVotes -= 1;
        }
        else if (_update == 1){
            candidates[_candidateId].noVotes += 1;
        }

        // update candidate vote Count
        //candidates[_candidateId].noVotes += _update;

        // trigger voted event
        emit votedEvent(_candidateId);
    } 

}

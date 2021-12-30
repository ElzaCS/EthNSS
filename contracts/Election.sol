pragma solidity ^0.5.0;

contract Election {
    // Model a Candidate
    struct Candidate {
        uint id;
        string name;
        string dept; //location
        string roll; // target
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
        addCandidate("The Voice of the Martyrs", "U.S.A.", "Minority Religions", "./files/TheVoice.txt", "665145069", 0x90847b64DcF6e73fdf02081c645d995e4dA1Fa05);
        addCandidate("Jivdaya Charitable Trust", "Gujarat", "Animal care", "./files/Jivdaya.txt", "-139417957", 0xd370e7d8733eae69CAcc393b5b7B95Ee8FF029e8);
        addCandidate("Mitti Cafe", "Asia-Pacific", "Person with Disability", "./files/Mitti.txt", "694526058", 0xC5Bdabd2365Af1aEbbC82d908Ab02a0955b9cD6c);
        addCandidate("Salahuddin Ayyubi Foundation", "Rajasthan", "Health care", "./files/Salahuddin.txt", "-1726948915", 0xbb7DE66AA50085C2d343BDed2D528bE2A41b7DA9);
        addCandidate("Bala Vikasa International Center", "Andhra Pradesh", "Social Entrepreneurship", "./files/Bala.txt", "-243014348", 0xDf579cCf6947762258DfD0db1A26f471222D81aa);
        addCandidate("Annamrita Foundation", "Maharashtra", "Rural Children", "./files/Annamrita.txt", "1019967638", 0x4cB65c3279e5A336aAC5834eb267B74508d9f856);
        addCandidate("Educate Girls", "U.S.A.", "Girls Education", "./files/Educate.txt", "651909930", 0xcB4C53046EaB1F9f8062822181aeCE1B80cd16b5);
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

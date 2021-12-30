$(function() {
  $(window).load(function() {
    App.init();
  });
});

App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() { return App.initWeb3(); },

  initWeb3: function() {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      window.ethereum.enable();
      web3 = new Web3(App.web3Provider);
      return App.initContract();
    }
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
      return App.initContract();
    }
  },


  initContract: async function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate new truffle contract
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      App.listenForEvents();

      App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },


  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");
    var voted = false;

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    })
    .then(function(candidatesCount) {
      var candArray = [];
      for (var i = 1; i <= candidatesCount; i++) {
        candArray.push(electionInstance.candidates(i));
      }

      var tempCand;
      Promise.all(candArray).then(function(candArray) {
          var v_candidates = $("#candidates");
          v_candidates.empty();

          var candidatesResults = $("#candidatesResults");
          candidatesResults.empty();

          var candidatesSelect1 = $('#candidatesSelect1');
          candidatesSelect1.empty();

          var candidatesSelect2 = $('#candidatesSelect2');
          candidatesSelect2.empty();

          var v_alert = $("#alert");
          // v_alert.empty(); 

          tempCand = candArray[0][0];
          console.log(candArray)

          var currCand;

          for (var i = 0; i < candidatesCount; i++) {
            var id = candArray[i][0];
            var name = candArray[i][1];
            var dept = candArray[i][2];
            var roll = candArray[i][3];
            var fileLoc = candArray[i][4];
            var actualHash = candArray[i][5];
            var accAddr = candArray[i][6];

            if (accAddr == App.account){
              currCand = candArray[i];
            }
            var currHash;
            var voteCount = 0;
            var noVotes = candArray[i][7] - 100;

            App.file_get_contents(fileLoc, actualHash);

            // Render candidates
            var candidateTemplate1 = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + dept + "</td><td>" + roll + "</td><td><a href=" + fileLoc + ">File</a></td><td>" + noVotes + "</td></tr>"
            v_candidates.append(candidateTemplate1);

            // Render candidate ballot option
            var candidateOption = "<option value='" + id + "-" + accAddr + "'>" + name + "</ option>"
            candidatesSelect1.append(candidateOption);
            candidatesSelect2.append(candidateOption);
            voted = false;
          }
          // Render candidatesResults
          if (currCand){
            $("#formNewOrg").hide();
            var candidateTemplate = "<tr><th>ID</th><td>" + currCand[0] + "</td></tr>"
              candidatesResults.append(candidateTemplate);
            candidateTemplate = "<tr><th>Name</th><td>" + currCand[1] + "</td></tr>"
              candidatesResults.append(candidateTemplate);
            candidateTemplate = "<tr><th>Headquarters</th><td>" + currCand[2] + "</td></tr>"
              candidatesResults.append(candidateTemplate);
            candidateTemplate = "<tr><th>Target</th><td>" + currCand[3] + "</td></tr>"
              candidatesResults.append(candidateTemplate);
            candidateTemplate = "<tr><th>Agenda</th><td>" + currCand[4] + "</td></tr>"
              candidatesResults.append(candidateTemplate);
            candidateTemplate = "<tr><th>Agenda Hash</th><td>" + currCand[5] + "</td></tr>"
              candidatesResults.append(candidateTemplate);
            candidateTemplate = "<tr><th>Supporters</th><td>" + (currCand[7]-100) + "</td></tr>"
              candidatesResults.append(candidateTemplate);
          }
          else{
            var candidateTemplate = "<tr><th colspan='2'>You have not registered an org yet</th></tr>"
              candidatesResults.append(candidateTemplate);
          }
      });
      return electionInstance.voters(App.account);
    })
    .then(function(hasVoted) {
      // Do not allow a user to vote
      if(hasVoted) {
        $("#formVote").hide();
        var v_alert = $("#alert");
        v_alert.empty();
        v_alert.append("<h3 style='color:green'>Thank You for Down-voting! We'll look into it</h3>")
      }
      else {
        var v_alert = $("#alert");
        v_alert.empty();  
      }
      loader.hide();
      content.show();
    })
    .catch(function(error) {
      console.warn(error);
    });
  },

  addOrg: function() {
    var orgName = $('#newCandName').val();
    var location = $('#newCandHQ').val();
    var target = $('#newCandTarget').val();
    var fileLoc = $('#newCandAgenda').val();
    var fileHash = App.file_get_hash(fileLoc).toString();
    // console.log("add:", orgName, location, target, fileLoc, fileHash);
    App.file_get_hash(fileLoc)
      .then((fileHash) => {
        var fHash = fileHash.toString();
        App.contracts.Election.deployed().then(function(instance) {
          return instance.addCandidate(orgName, location, target, fileLoc, fHash, App.account, { from: App.account });
        }).then(function(result) {
          // Wait for update
          $("#content").hide();
          $("#loader").show();
          $("#formNewOrg").hide();
        }).catch(function(err) {
          console.error(err);
        });        
      })
  },

  castVote: function() {
    var vals = $('#candidatesSelect1').val();
    var valArray = vals.split("-");
    var candidateId = valArray[0];
    var addr = valArray[1];

    App.contracts.Election.deployed().then(function(instance) {
      return instance.vote(candidateId, 0, { from: App.account });
    }).then(function(result) {
      // Wait for update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  },

  donate: function() {
    var vals = $('#candidatesSelect2').val();
    var amt = $('#candidatesAmt2').val();
    var valArray = vals.split("-");
    var candidateId = valArray[0];
    var addr = valArray[1];
    // App.sendEther(addr, amt);
    App.contracts.Election.deployed().then(function(instance) {
      return instance.vote(candidateId, 1, { from: App.account });
    }).then(function(result) {
      // Wait for update
      App.sendEther(addr, amt);
    }).catch(function(err) {
      console.error(err);
    });
    
    $('#candidatesAmt2').val('');
    var v_alert = $("#alert");
    v_alert.empty();
    v_alert.append("<h3 style='color:green'>Thank You for your donation!</h3>")
  },

  sendEther: function(addr, amt) {
    console.log("sendEther:sender:", addr);
    console.log(web3.eth.accounts)
    web3.eth.sendTransaction({
        from: web3.eth.accounts[0],
        to: addr, 
        value: web3.toWei(amt, "ether"), 
    }, function(err, transactionHash) {
        if (err) { 
            console.log(err); 
        } else {
        }
    });
  },

  file_get_contents: function(filename, actHash) {
      return fetch(filename)
        .then((resp) => resp.text())
        .then(function(data) {
            var string = data;
            var hash = 0;
            if (string.length == 0) return hash;
            for (i = 0; i < string.length; i++) {
                char = string.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            if ( actHash != hash){
                  var v_alert = $("#alert");
                  v_alert.empty();
                  v_alert.append("<h3 style='color:red'>The agenda files are found to have been tampered. Please notify the concerned authorities.</h3>")
              }
            return hash;
        });
  },

  file_get_hash: function(filename) {
      return fetch(filename)
        .then((resp) => resp.text())
        .then(function(data) {
            var string = data;
            var hash = 0;
            if (string.length == 0) return hash;
            for (i = 0; i < string.length; i++) {
                char = string.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return hash;
        });
  }

};


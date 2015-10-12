PlayersList = new Mongo.Collection('playerslit');

if(Meteor.isClient) {

     Template.players.helpers({
          getPlayers: function() {
               return PlayersList.find({}, {sort: {score: -1, name: 1}}).fetch();
          },

          isHighlighted: function() {
               var currentPlayer = this._id;
               var selectedPlayer = Session.get('selectedPlayer');
               if(currentPlayer == selectedPlayer) {
                    return "highlighted";
               }
          },

          displaySelected: function() {
               var selectedPlayer = Session.get('selectedPlayer');
               return PlayersList.findOne(selectedPlayer);
          }
     });

     Template.players.events({
          'submit form': function(e) {
               e.preventDefault();
               var newPlayerName = e.target.newPlayerName.value;
               var newPlayerScore = Number(e.target.newPlayerScore.value);

               Meteor.call('createNewPlayer', newPlayerName, newPlayerScore);

               e.target.newPlayerName.value = "";
               e.target.newPlayerScore.value = "";
          },

          'click .player': function() {
               var selectedPlayer = this._id;
               Session.set('selectedPlayer', selectedPlayer);
          },

          'click .givePoints': function() {
               var selectedPlayer = Session.get('selectedPlayer');
               Meteor.call('modifyScore', selectedPlayer, 5)
          },

          'click .takePoints': function() {
               var selectedPlayer = Session.get('selectedPlayer');
               Meteor.call('modifyScore', selectedPlayer, -5);
          },

          'click .delete': function() {
               var selectedPlayer = Session.get('selectedPlayer');
               Meteor.call('deletePlayer', selectedPlayer);
          }
     });

     Accounts.ui.config({
          passwordSignupFields: "USERNAME_ONLY"
     });

     Meteor.subscribe('listOfPlayers');

}

if(Meteor.isServer) {
     Meteor.publish('listOfPlayers', function() {
          var currentUser = this.userId;
          return PlayersList.find({addedBy: currentUser});
     });

     Meteor.methods({
          createNewPlayer: function(newPlayerName, newPlayerScore, addedByName) {
               var addedByName = Meteor.userId();

               PlayersList.insert({
                    name: newPlayerName,
                    score: newPlayerScore,
                    addedBy: addedByName,
                    addedOn: moment().format('HH:mm:ss:SS, Do of MMMM gggg')
               });
          },

          deletePlayer: function(selectedPlayer) {
               PlayersList.remove(selectedPlayer)
          },

          modifyScore: function(selectedPlayer, difference) {
               var currentUser = Meteor.userId();
               PlayersList.update({_id: selectedPlayer, addedBy: currentUser},
                                  {$inc: {score: difference}});
          }
     });
}
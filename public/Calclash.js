var myDataRef = new Firebase('https://calclashme.firebaseio.com/');
var gamesDataRef = myDataRef.child('games');
var playerNum = -1;

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var name = getParameterByName('name');
if (!name || name.length <= 0) {
	window.location = '/';
}

var problems = [],
    upperBound = 13,
    lowerBound = 2,
    currProblem,
	points = 0,
	opponentPoints = 0;

for (var i = lowerBound; i < upperBound; i++) {
    for (var j = lowerBound; j < upperBound; j++) {
        problems.push({
            first: i + 1,
            second: j + 1,
            answer: (i + 1) * (j + 1)
        });
    }
}

var showProblem = function() {
    $('p').fadeOut(250, function() {
        currProblem = problems[Math.floor(Math.random() * problems.length)];
        $('#first').text(currProblem.first);
        $('#second').text(currProblem.second);
        $('p').fadeIn(250);
    });
};

var checkProblem = function() {
    if (parseInt($('#answer').val()) === currProblem.answer) {
        console.log('GOOD JOB');
        $('#answer').val('');
        $('#answer').focus();
        return true;
    } else {
        console.log('YOU FUCKED UP');
        $('#problem').effect("shake");
		$('#problem').addClass('wrong');
		setTimeout(function(){
			$('#problem').removeClass('wrong');
		}, 250);
        $('#answer').val('');
        $('#answer').focus();
        return false;
    }
};

var joinGame = function(gameSnapshot, cb){
	gameSnapshot.ref().update({playerCount: 2}, function() {
		gameSnapshot.ref().child('players').on('value', function(snapshot) {
			gameSnapshot.ref().child('players').off('value');
			var val = snapshot.val();
			gameSnapshot.ref().child('players').push({
				name: name,
				picture: 'http://i.imgur.com/X9JQVsX.jpg'
			}, function(){
				playerNum = 2;
				$('#player2-name').html(name);
				$('#player1-name').html(val[0].name);
				gameSnapshot.ref().onDisconnect().remove();
				cb();
			});
		});
	});
};

var createGame = function(cb){
	console.log('attempting create');
	var gameRef = gamesDataRef.push({
		playerCount: 1,
		players: [{
			name: name,
			picture:  'http://i.imgur.com/X9JQVsX.jpg' 
		}],
		playerScore1: 0,
		playerScore2: 0,
		gameFinished: false
	}, function(){
		playerNum = 1;
		gameRef.onDisconnect().remove();
		$('#player1-name').html(name);
		cb(gameRef);
	});
};

var bindDisconnectListener = function(gameRef){
	gameRef.on('value',function(dataSnapshot){
		if(dataSnapshot.val() === null){
			alert('Your opponent has left the game! You will be returned to the home screen');
			window.location.replace("/")
		}
	});
};

var bindOpponentPointListener = function(gameRef){
	var scoreVariable, scoreElement;
	if (playerNum == -1) {
		throw new Error('WAT, we ain\'t connected yo');
	} else if (playerNum == 1) {
		scoreVariable = 'playerScore2';
		scoreElement = '#player2-points';
	} else {
		scoreVariable = 'playerScore1';
		scoreElement = '#player1-points';
	}
	
	gameRef.child(scoreVariable).on('value',function(scoreSnapshot){
		opponentPoints = scoreSnapshot.val();
		$(scoreElement).html(opponentPoints);
	});
};

var bindMyPointListener = function(gameRef){
	var scoreVariable, scoreElement, scoreRef;
	if (playerNum == -1) {
		throw new Error('WAT, we ain\'t connected yo');
	} else if (playerNum == 2) {
		scoreVariable = 'playerScore2';
		scoreElement = '#player2-points';
	} else {
		scoreVariable = 'playerScore1';
		scoreElement = '#player1-points';
	}
	scoreRef = gameRef.child(scoreVariable);
	
	// This enables us to hit the enter button and submit input
    $('#answer').keypress(function (e) {
		if ((e.which == 13)&&!($('#answer').val().length == 0)){
			if (checkProblem()) {
				console.log('You got 100 points');
				points += 100;
				scoreRef.set(points);
				showProblem();
				$(scoreElement).html(points);
			}
			return false; 
		}
    });
};

var bindJoinListener = function(gameRef){
	gameRef.child('players').on('child_added',function(childSnapshot, previousChildName){
		if(previousChildName){
			console.log('child_added', childSnapshot.val());
			$('#player2-name').html(childSnapshot.val().name);
			gameRef.child('players').off();
			$('#overlay').fadeOut();
			startTimer(gameRef);
		}
	});
};

var finishGame = function(gameRef) {
	if(points > opponentPoints){
		$('#overlay p').html('WINNER!!!');
		$('#overlay').fadeIn();
	} else if (points === opponentPoints) {
		$('#overlay p').html('TIED!!!');
		$('#overlay').fadeIn();
	} else {
		$('#overlay p').html('LOSER!!!');
		$('#overlay').fadeIn();
	}
};

var bindGameFinishedListener = function(gameRef){
	gameRef.child('gameFinished').on('value', function(gameSnapshot){
		if (gameSnapshot.val()) finishGame(gameRef);
	});
};

//This setInterval function will take an elemant and decrement it by 1 till 0
var startTimer = function(gameRef){
	var j = 60;
	var timerInterval = setInterval(function(){
		if (j == 10) {
			$('#timer').css("color","red");
			$('#timer').html(j);
		} else if((j <= 9)&&(j > 0)) {
			$('#timer').html('0'+j);
		} else if(j == 0) {
			$('#timer').html('0'+j);
			clearInterval(timerInterval);
			gameRef.child('gameFinished').set(true);	
		} else {
			$('#timer').html(j);
		}
		j--;
	}, 1000);
};

$(function() {
	gamesDataRef.on('value', function(snapshot){
		gamesDataRef.off('value');
		console.log('snapshot', snapshot);
		// Given a DataSnapshot containing a child 'fred' and a child 'wilma':
		var joinedGame = false;
		snapshot.forEach(function(childSnapshot) {
			console.log('found child', childSnapshot.val());
			if (joinedGame) return;
			// This code will be called twice.
			var name = childSnapshot.name();
			var childData = childSnapshot.val();
			// name will be 'fred' the first time and 'wilma' the second time.
			// childData will be the actual contents of the child.
			if(childData.playerCount <= 1){
				joinedGame = true;
				joinGame(childSnapshot, function() {
					$('#overlay').fadeOut();
					startTimer(childSnapshot.ref());
					bindGameFinishedListener(childSnapshot.ref());
					bindDisconnectListener(childSnapshot.ref());
					bindMyPointListener(childSnapshot.ref());
					bindOpponentPointListener(childSnapshot.ref());
					console.log('We joined dat game doe');
				});
			}
		});
		if(!joinedGame){
			createGame(function(gameRef) {
				bindJoinListener(gameRef);
				bindGameFinishedListener(gameRef);
				bindDisconnectListener(gameRef);
				bindMyPointListener(gameRef);
				bindOpponentPointListener(gameRef);
				console.log('We done created dat game doe');
			});
		}
	});
	// This shows the problem and calls the check problem function
    showProblem();
	// This setInterval function moves moves the background's css position every 15ms, to give us the illusion of scrolling
	var i = 0;
	setInterval(function(){
		$('#first-background').css('marginLeft', i-- + 'px');
		$('#second-background').css('marginLeft', i-- + 'px');
		if((i*-1) >= (($(window).width()))){
			i = 0;			
		}
	}, 15);
});
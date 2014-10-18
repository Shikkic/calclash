var problems = [],
    upperBound = 15,
    lowerBound = 5,
    currProblem;

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
		$('#problem ').addClass('wrong');
		setTimeout(function(){
			$('#problem').removeClass('wrong');
		}, 250);
        $('#answer').val('');
        $('#answer').focus();
        return false;
    }
};

$(function() {
	//This setInterval function will take an elemant 
	var j = 60;
	setInterval(function(){
		$('timer').val(j	);
		j--;
	}, 1000);
	
	// This shows the problem and calls the check problem function
    showProblem();
    $('button').click(function() {
        if (checkProblem()) {
            showProblem();
        }
    });
	
	// This enables us to hit the enter button and submit input
    $('#answer').keypress(function (e) {
      if ((e.which == 13)&&!($('#answer').val().length == 0)){
          if (checkProblem()) {
               showProblem();
          }
          return false;    //<---- Add this line
      }
    });
	
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
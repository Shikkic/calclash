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
		$('p').effect("shake");
        $('#answer').val('');
        $('#answer').focus();
        return true;
    } else {
        console.log('YOU FUCKED UP');
        $('p').effect
        $('#answer').val('');
        $('#answer').focus();
        return false;
    }
};


$(function() {
    showProblem();
    $('button').click(function() {
        if (checkProblem()) {
            showProblem();
        }
    });
    $('#answer').keypress(function (e) {
      if (e.which == 13) {
          if (checkProblem()) {
               showProblem();
          }
          return false;    //<---- Add this line
      }
    });
});
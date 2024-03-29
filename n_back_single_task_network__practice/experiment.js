/* ************************************ */
/*       Define Helper Functions        */
/* ************************************ */

//Functions added for in-person sessions
function genITIs() { 
	mean_iti = 0.5 //mean and standard deviation of 0.5 secs
	min_thresh = 0
	max_thresh = 4

	lambda = 1/mean_iti
	iti_array = []
	for (i=0; i < exp_len + 3*numTestBlocks ; i++) { //add 3 ITIs per test block to make sure there are enough
		curr_iti = - Math.log(Math.random()) / lambda;
		while (curr_iti > max_thresh || curr_iti < min_thresh) {
			curr_iti = - Math.log(Math.random()) / lambda;
		}
		iti_array.push(curr_iti*1000) //convert ITIs from seconds to milliseconds

	}
	return(iti_array)
}

function getITI_stim() { //added for fMRI compatibility
	var currITI = ITIs_stim.shift()
	return currITI
}

function getITI_resp() { //added for fMRI compatibility
	var currITI = ITIs_resp.shift()
	return currITI
}
//added for motor counterbalancing
function getMotorPerm() {
	return motor_perm
}

// var possible_responses = [['index finger', 37],['middle finger', 39]]

function getPossibleResponses() {
	if (getMotorPerm()==0) {
		return possible_responses
	} else if (getMotorPerm()==1) {
		return [['middle finger', 39],['index finger', 37]]
	}
}

function getPromptTextList() {
	return '<ul style="text-align:left;">'+
	'<li>Match the current letter to the letter that appeared some number of trials ago</li>' +
	'<li>If they match, press your '+getPossibleResponses()[0][0]+'</li>' +
	'<li>If they mismatch, press your '+getPossibleResponses()[1][0]+'</li>' +
  '</ul>'

}

function getPromptText() {
	return '<div class = prompt_box>'+
	'<p class = center-block-text style = "font-size:16px; line-height:80%%;">Match the current letter to the letter that appeared 1 trial ago</p>' +
	'<p class = center-block-text style = "font-size:16px; line-height:80%%;">If they match, press your '+getPossibleResponses()[0][0]+'</p>' +
	'<p class = center-block-text style = "font-size:16px; line-height:80%%;">If they mismatch, press your '+getPossibleResponses()[1][0]+'</p>' +
'</div>'
}


function getTimeoutMessage() {
	return '<div class = upperbox><div class = center-text>Respond Faster!</div></div>' +
	getPromptTextList()
  }

//feedback functions added for in-person version
var getPracticeFeedback = function() {
	if (getPracticeTrialID()=='instructions') {
		return '<div class = instructbox>'+
		'<p class = instruct-text>In this task, you will see a letter on every trial.</p>'+
		'<p class = instruct-text>You will be asked to match the current letter to the letter that appeared either 1 or 2 trials ago depending on the delay given to you for that block.</p>'+
		'<p class = instruct-text><strong>Press your '+getPossibleResponses()[0][0]+' if the letters match, and your '+getPossibleResponses()[1][0]+' if they mismatch.</strong></p>'+
		'<p class = instruct-text>Your delay (the number of trials ago which you must match the current letter to) will change from block to block. You will be given the delay at the start of every block of trials.</p>'+
		'<p class = instruct-text>Capitalization does not matter, so "T" matches with "t".</p> '+
		'<p class = instruct-text><strong><i>Your delay for this upcoming practice round is 1</i>.</strong></p> '+
		'<p class = instruct-text>During practice, you will see a reminder of the rules.  <i> This will be removed for the test</i>. </p>'+ 
		'<p class = instruct-text>When you are ready to begin, please press the spacebar. </p>'+
		'</div>'

	} else {
		return '<div class = bigbox><div class = picture_box><p class = instruct-text><font color="white">' + practice_feedback_text + '</font></p></div></div>'
	}
}

//feedback functions added for in-person version
// var getPracticeFeedback = function() {
// 	return '<div class = bigbox><div class = picture_box><p class = instruct-text><font color="white">' + practice_feedback_text + '</font></p></div></div>'
// }

var getPracticeTrialID = function() {
	return practice_trial_id
}

var getPracticeFeedbackTiming = function() {
	return practice_feedback_timing
}

var getPracticeResponseEnds = function() {
	return practice_response_ends
}
//

function getDisplayElement() {
    $('<div class = display_stage_background></div>').appendTo('body')
    return $('<div class = display_stage></div>').appendTo('body')
}

function addID() {
  jsPsych.data.addDataToLastTrial({exp_id: 'n_back_single_task_network__practice'})
}


function assessPerformance() {
	var experiment_data = jsPsych.data.getTrialsOfType('poldrack-single-stim')
	var missed_count = 0
	var trial_count = 0
	var rt_array = []
	var rt = 0
	var correct = 0
	
		//record choices participants made
	var choice_counts = {}
	choice_counts[-1] = 0
	choice_counts[37] = 0
	choice_counts[39] = 0
	for (var k = 0; k < getPossibleResponses().length; k++) {
		choice_counts[getPossibleResponses()[k][1]] = 0
	}
	for (var i = 0; i < experiment_data.length; i++) {
		if (experiment_data[i].trial_id == 'test_trial'){
			trial_count += 1
			rt = experiment_data[i].rt
			key = experiment_data[i].key_press
			choice_counts[key] += 1
			if (rt == -1) {
				missed_count += 1
			} else {
				rt_array.push(rt)
			}
			
			if (key == experiment_data[i].correct_response){
				correct += 1
			}
		}
	}

	//calculate average rt
	var avg_rt = -1
	if (rt_array.length !== 0) {
		avg_rt = math.median(rt_array)
	} 
	//calculate whether response distribution is okay
	var responses_ok = true
	Object.keys(choice_counts).forEach(function(key, index) {
		if (choice_counts[key] > trial_count * 0.85) {
			responses_ok = false
		}
	})
	var missed_percent = missed_count/trial_count
	var accuracy = correct / trial_count
	credit_var = (missed_percent < 0.25 && avg_rt > 200 && responses_ok && accuracy > 0.60)
	jsPsych.data.addDataToLastTrial({final_credit_var: credit_var,
									 final_missed_percent: missed_percent,
									 final_avg_rt: avg_rt,
									 final_responses_ok: responses_ok,
									 final_accuracy: accuracy})
}


var getResponse = function() {
	return correct_response
}

var getFeedback = function() {
	return '<div class = bigbox><div class = picture_box><p class = instruct-text><font color="white">' + feedback_text + '</font></p></div></div>'
}


var randomDraw = function(lst) {
	var index = Math.floor(Math.random() * (lst.length))
	return lst[index]
};


var createTrialTypes = function(numTrialsPerBlock, delay){
	first_stims = []
	for (var i = 0; i < 2; i++){ //SHIFTED BECAUSE MAX DELAY == 2 NOW
		if (i < delay){
			n_back_condition = 'N/A'
		} else {
			n_back_condition = n_back_conditions[Math.floor(Math.random() * 5)]
		}
		probe = randomDraw(letters)
		correct_response = getPossibleResponses()[1][1]
		if (n_back_condition == 'match'){
			correct_response = getPossibleResponses()[0][1]
			probe = randomDraw([first_stims[i - delay].probe.toUpperCase(), first_stims[i - delay].probe.toLowerCase()])
		} else if (n_back_condition == "mismatch"){
			probe = randomDraw('bBdDgGtTvV'.split("").filter(function(y) {return $.inArray(y, [first_stims[i - delay].probe.toLowerCase(), first_stims[i - delay].probe.toUpperCase()]) == -1}))
			correct_response = getPossibleResponses()[1][1]
		}
		
		
		first_stim = {
			n_back_condition: n_back_condition,
			probe: probe,
			correct_response: correct_response,
			delay: delay
		}	
		first_stims.push(first_stim)	
	}
	
	stims = []
	
	for(var numIterations = 0; numIterations < numTrialsPerBlock/n_back_conditions.length; numIterations++){
		for (var numNBackConds = 0; numNBackConds < n_back_conditions.length; numNBackConds++){
			
			n_back_condition = n_back_conditions[numNBackConds]
			
			stim = {
				n_back_condition: n_back_condition
				}
			stims.push(stim)
		}
	}
	
	stims = jsPsych.randomization.repeat(stims,1)
	stims = first_stims.concat(stims)
	
	stim_len = stims.length
	
	new_stims = []
	for (i = 0; i < stim_len; i++){
		if (i < 2){ //dropped to 2 because we have a max of 2-back
			stim = stims.shift()
			n_back_condition = stim.n_back_condition
			probe = stim.probe
			correct_response = stim.correct_response
			delay = stim.delay
		} else {
			stim = stims.shift()
			n_back_condition = stim.n_back_condition
		
			if (n_back_condition == "match"){
				probe = randomDraw([new_stims[i - delay].probe.toUpperCase(), new_stims[i - delay].probe.toLowerCase()])
				correct_response = getPossibleResponses()[0][1]
			} else if (n_back_condition == "mismatch"){
				probe = randomDraw('bBdDgGtTvV'.split("").filter(function(y) {return $.inArray(y, [new_stims[i - delay].probe.toLowerCase(), new_stims[i - delay].probe.toUpperCase()]) == -1}))
				correct_response = getPossibleResponses()[1][1]
		
			}			
		}
		
		stim = {
			n_back_condition: n_back_condition,
			probe: probe,
			correct_response: correct_response,
			delay: delay
		}
		
		new_stims.push(stim)
	}
	return new_stims
}


var getStim = function(){	
	stim = stims.shift()
	n_back_condition = stim.n_back_condition
	probe = stim.probe
	correct_response = stim.correct_response
	delay = stim.delay
	
	if (probe == probe.toUpperCase()) {
	 letter_case = 'uppercase'
	} else if (probe == probe.toLowerCase()) {
	 letter_case = 'lowercase'
	}
	
	return task_boards[0]+ preFileType  + letter_case + '_' + probe.toUpperCase() + fileTypePNG + task_boards[1]	
}

var getResponse =  function(){
	return correct_response
}

var appendData = function(){
	curr_trial = jsPsych.progress().current_trial_global
	trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id
	current_trial+=1
	
	
	if (trial_id == 'practice_trial'){
		current_block = practiceCount
	} else if (trial_id == 'test_trial'){
		current_block = testCount
	}
		
	jsPsych.data.addDataToLastTrial({
		n_back_condition: n_back_condition,
		probe: probe,
		correct_response: correct_response,
		delay: delay,
		current_trial: current_trial,
		current_block: current_block,
		letter_case: letter_case
	})
		
	if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press == correct_response){
		jsPsych.data.addDataToLastTrial({
			correct_trial: 1,
		})
	
	} else if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press != correct_response){
		jsPsych.data.addDataToLastTrial({
			correct_trial: 0,
		})
	
	}			
}

/* ************************************ */
/*    Define Experimental Variables     */
/* ************************************ */




// generic task variables
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = 0


var practice_len = 15 // must be divisible by 5
var exp_len = 220 //150 // must be divisible by 5 --9:30
var numTrialsPerBlock = 55 // 50, must be divisible by 5 and we need to have a multiple of 2 blocks (2,4,6) in order to have equal delays across blocks
var numTestBlocks = exp_len / numTrialsPerBlock //should be divisble by 3 ^^
var practice_thresh = 4 // 4 blocks of 15 trials

var accuracy_thresh = 0.75
var rt_thresh = 1000
var missed_thresh = 0.10

var delays = jsPsych.randomization.repeat([1, 2], numTestBlocks / 2) //jsPsych.randomization.repeat([1, 2, 3], numTestBlocks / 3)

var delay = 1

var pathSource = "/static/experiments/n_back_single_task_network__practice/images/"
var fileTypePNG = ".png'></img>"
var preFileType = "<img class = center src='/static/experiments/n_back_single_task_network__practice/images/"


var n_back_conditions = jsPsych.randomization.repeat(['mismatch','mismatch','match','mismatch','mismatch'],1)
// var possible_responses = [['index finger', 89],['middle finger', 71]]
var possible_responses = [['index finger', 37],['middle finger', 39]]
							 
var letters = 'bBdDgGtTvV'.split("")
							 



// var prompt_text_list = '<ul style="text-align:left;">'+
// 						'<li>Match the current letter to the letter that appeared some number of trials ago</li>' +
// 						'<li>If they match, press your '+possible_responses[0][0]+'</li>' +
// 					    '<li>If they mismatch, press your '+possible_responses[1][0]+'</li>' +
// 					  '</ul>'

// var prompt_text = '<div class = prompt_box>'+
// 					  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Match the current letter to the letter that appeared 1 trial ago</p>' +
// 					  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">If they match, press your '+possible_responses[0][0]+'</p>' +
// 					  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">If they mismatch, press your '+possible_responses[1][0]+'</p>' +
// 				  '</div>'

var current_trial = 0
var current_block = 0

//PRE LOAD IMAGES HERE
var pathSource = "/static/experiments/n_back_single_task_network__practice/images/"
var lettersPreload = ['B','D','G','T','V']
var casePreload = ['lowercase','uppercase']
var images = []

for(i = 0; i < lettersPreload.length; i++){
	for(x = 0; x < casePreload.length; x++){
		images.push(pathSource + casePreload[x] + '_' + lettersPreload[i] + '.png')
	}
}

jsPsych.pluginAPI.preloadImages(images);

//ADDED FOR SCANNING
//fmri variables
var ITIs_stim = []
var ITIs_resp = []

//practice feedback variables
// var practice_feedback_text = '<div class = instructbox>'+
// '<p class = instruct-text>In this task, you will see a letter on every trial.</p>'+
// '<p class = instruct-text>You will be asked to match the current letter to the letter that appeared either 1, 2, or 3 trials ago depending on the delay given to you for that block.</p>'+
// '<p class = instruct-text><strong>Press your '+possible_responses[0][0]+' if the letters match, and your '+possible_responses[1][0]+' if they mismatch.</strong></p>'+
// '<p class = instruct-text>Your delay (the number of trials ago which you must match the current letter to) will change from block to block. You will be given the delay at the start of every block of trials.</p>'+
// '<p class = instruct-text>Capitalization does not matter, so "T" matches with "t".</p> '+
// '<p class = instruct-text><i><strong>Your delay for this upcoming practice round is 1</strong></i>.</p> '+
// '<p class = instruct-text>During practice, you will see a reminder of the rules.  <i> This will be removed for the test</i>. </p>'+ 
// '<p class = instruct-text>When you are ready to begin, please press the spacebar. </p>'+
// '</div>'
var practice_trial_id = "instructions"
var practice_feedback_timing = -1
var practice_response_ends = true

var motor_perm = 0
/* ************************************ */
/*          Define Game Boards          */
/* ************************************ */

var task_boards = ['<div class = bigbox><div class = centerbox><div class = gng_number><div class = cue-text>','</div></div></div></div>']		

// var stims = createTrialTypes(practice_len, delay)
var stims = []

/* ************************************ */
/*        Set up jsPsych blocks         */
/* ************************************ */


var intro_block = {
	type: 'poldrack-single-stim',
	data: {
		trial_id: "instructions"
	},
	choices: [32],
	stimulus: '<div class = centerbox><p class = center-block-text> Welcome to the experiment.</p></div>',
	timing_post_trial: 0,
	is_html: true,
	timing_response: -1,
	response_ends_trial: true, 

};


var end_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "end"
	},
	timing_response: 10000,
	text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p></div>',
	cont_key: [32],
	timing_post_trial: 0,
	on_finish: function(){
		assessPerformance()
    }
};

var practice_end_block = {
	type: 'poldrack-text',
	data: {
	  trial_id: "end",
	},
	text: '<div class = centerbox><p class = center-block-text>Thanks for completing this practice!</p></div>',
	cont_key: [32],
	timing_response: 10000,
	response_ends_trial: true,
	on_finish: function(){
	  assessPerformance()
	  }
  };




var practice_feedback_block = {
	type: 'poldrack-single-stim',
	stimulus: getPracticeFeedback,
	data: {
		trial_id: getPracticeTrialID
	},
	choices: [32],
	timing_post_trial: 0,
	is_html: true,
	timing_response: -1, //10 seconds for feedback
	timing_stim: -1,
	response_ends_trial: true,
	on_finish: function() {
		practice_trial_id = "practice-no-stop-feedback"
		practice_feedback_timing = 10000
		practice_response_ends = false
		if (ITIs_stim.length===0) { //if ITIs haven't been generated, generate them!
			ITIs_stim = genITIs()
			ITIs_resp = ITIs_stim.slice(0) //make a copy of ITIs so that timing_stimulus & timing_response are the same
		}

	} 

};


var practice_fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "practice_fixation"
	},
	timing_response: 500, //500
	timing_post_trial: 0,
	prompt: getPromptTextList
}

var ITI_fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "fixation",
	},
	timing_post_trial: 0,
	timing_stim: getITI_stim, //500
	timing_response: getITI_resp //500
};



var feedback_text = 
	'Welcome to the experiment. This experiment will take around 5 minutes. Press <i>enter</i> to begin.'
var feedback_block = {
	type: 'poldrack-single-stim',
	data: {
		trial_id: "practice-no-stop-feedback"
	},
	choices: 'none',
	stimulus: getFeedback,
	timing_post_trial: 0,
	is_html: true,
	timing_response: 10000,
	response_ends_trial: false, 

};


/* ************************************ */
/*        Set up timeline blocks        */
/* ************************************ */

var motor_setup_block = {
	type: 'survey-text',
	data: {
		trial_id: "motor_setup"
	},
	questions: [
		[
			"<p class = center-block-text>motor permutation (0-1):</p>"
		]
	], on_finish: function(data) {
		motor_perm=parseInt(data.responses.slice(7, 10))
		stims = createTrialTypes(practice_len, delay)
		
	}
}

var practiceTrials = []
practiceTrials.push(practice_feedback_block)
for (i = 0; i < practice_len + 2; i++) {	//was changed from + 3 as delays went from 1:3 to 1:2
	var practice_block = {
		type: 'poldrack-categorize',
		stimulus: getStim,
		is_html: true,
		choices: [getPossibleResponses()[0][1],getPossibleResponses()[1][1]],
		key_answer: getResponse,
		data: {
			trial_id: "practice_trial"
			},
		correct_text: '<div class = upperbox><div class = center-text><font size = 20>Correct!</font></div></div>',// + prompt_text_list,
		incorrect_text: '<div class = upperbox><div class = center-text><font size = 20>Incorrect</font></div></div>',// + prompt_text_list,
		timeout_message: getTimeoutMessage,
		timing_stim: 1000, //1000
		timing_response: 2000, //2000
		timing_feedback_duration: 500,
		show_stim_with_feedback: false,
		timing_post_trial: 0,
		on_finish: appendData,
		prompt: getPromptTextList,
		fixation_default: true
	}
	practiceTrials.push(practice_fixation_block)
	practiceTrials.push(practice_block)
}

var practiceCount = 0
var practiceNode1 = {
	timeline: practiceTrials,
	loop_function: function(data) {
		practiceCount += 1
		stims = createTrialTypes(practice_len, delay)
		current_trial = 0
	
		var sum_rt = 0
		var sum_responses = 0
		var correct = 0
		var total_trials = 0
		var mismatch_press = 0
	
		for (var i = 0; i < data.length; i++){
			if (data[i].trial_id == "practice_trial"){
				total_trials+=1
				if (data[i].rt != -1){
					sum_rt += data[i].rt
					sum_responses += 1
					if (data[i].key_press == data[i].correct_response){
						correct += 1
		
					}
				}
				
				if (data[i].key_press == getPossibleResponses()[1][1]){
					mismatch_press += 1
				}
		
			}
	
		}
	
		var accuracy = correct / total_trials
		var missed_responses = (total_trials - sum_responses) / total_trials
		var ave_rt = sum_rt / sum_responses
		var mismatch_press_percentage = mismatch_press / total_trials
	
		practice_feedback_text = "<br>Please take this time to read your feedback and to take a short break." // Press enter to continue"

		if (accuracy > accuracy_thresh){
			delay = 2
			stims = createTrialTypes(practice_len, delay)
			practice_feedback_text = "Your delay for this block is "+delay+". Please match the current letter to the letter that appeared "+delay+" trial(s) ago."
			return false
	
		} else if (accuracy < accuracy_thresh){
			if (missed_responses > missed_thresh){
				practice_feedback_text +=
						'</p><p class = instruct-text>You have not been responding to some trials.  Please respond on every trial that requires a response.'
			}

	      	if (ave_rt > rt_thresh){
	        	practice_feedback_text += 
	            	'</p><p class = instruct-text>You have been responding too slowly.'
	      	}
			
			if (mismatch_press_percentage >= 0.90){
				practice_feedback_text +=
						'</p><p class = instruct-text>Please do not simply press your "'+getPossibleResponses()[1][0]+'" to every stimulus. Please try to identify the matches and press your "'+getPossibleResponses()[0][0]+'" when they occur.'
			}
		
			if (practiceCount == practice_thresh){
				// practice_feedback_text +=
				// 	'</p><p class = instruct-text>Done with this practice. The test session will begin shortly.' 
					delay = 2
					stims = createTrialTypes(practice_len, delay)
					practice_feedback_text = "<p class = instruct-text><strong>Your delay for this block is "+delay+". Please match the current letter to the letter that appeared "+delay+" trial(s) ago.</strong></p>"
					return false
			}
			
			practice_feedback_text +=
				'</p><p class = instruct-text>We are going to try practice again to see if you can achieve higher accuracy.  Remember: <br>' + getPromptTextList() +
				'</p><p class = instruct-text>When you are ready to continue, please press the spacebar.</p>'
			
			
			return true
		
		}
		
	}
}

var practiceCount2 = 0
var practiceNode2 = {
	timeline: practiceTrials,
	loop_function: function(data) {
		practiceCount2 += 1
		stims = createTrialTypes(practice_len, delay)
		current_trial = 0
	
		var sum_rt = 0
		var sum_responses = 0
		var correct = 0
		var total_trials = 0
		var mismatch_press = 0
	
		for (var i = 0; i < data.length; i++){
			if (data[i].trial_id == "practice_trial"){
				total_trials+=1
				if (data[i].rt != -1){
					sum_rt += data[i].rt
					sum_responses += 1
					if (data[i].key_press == data[i].correct_response){
						correct += 1
		
					}
				}
				
				if (data[i].key_press == getPossibleResponses()[1][1]){
					mismatch_press += 1
				}
		
			}
	
		}
	
		var accuracy = correct / total_trials
		var missed_responses = (total_trials - sum_responses) / total_trials
		var ave_rt = sum_rt / sum_responses
		var mismatch_press_percentage = mismatch_press / total_trials
	
		practice_feedback_text = "<br>Please take this time to read your feedback and to take a short break." // Press enter to continue"

		if (accuracy > accuracy_thresh){
			practice_feedback_text +=
					'</p><p class = instruct-text>Done with this practice. The test session will begin shortly.' 
			delay = delays.pop()
			stims = createTrialTypes(numTrialsPerBlock, delay)
			feedback_text = "<p class = instruct-text><strong>Your delay for this block is "+delay+". Please match the current letter to the letter that appeared "+delay+" trial(s) ago.</strong></p>"
			return false
	
		} else if (accuracy < accuracy_thresh){
			if (missed_responses > missed_thresh){
				practice_feedback_text +=
						'</p><p class = instruct-text>You have not been responding to some trials.  Please respond on every trial that requires a response.'
			}

	      	if (ave_rt > rt_thresh){
	        	practice_feedback_text += 
	            	'</p><p class = instruct-text>You have been responding too slowly.'
	      	}
			
			if (mismatch_press_percentage >= 0.90){
				practice_feedback_text +=
						'</p><p class = instruct-text>Please do not simply press your "'+getPossibleResponses()[1][0]+'" to every stimulus. Please try to identify the matches and press your "'+getPossibleResponses()[0][0]+'" when they occur.'
			}
		
			if (practiceCount2 == practice_thresh){
				practice_feedback_text +=
					'</p><p class = instruct-text>Done with this practice. The test session will begin shortly.' 
					delay = delays.pop()
					stims = createTrialTypes(numTrialsPerBlock, delay)
					feedback_text = "<p class = instruct-text><strong>Your delay for this block is "+delay+". Please match the current letter to the letter that appeared "+delay+" trial(s) ago.</strong></p>"
					return false
			}
			
			practice_feedback_text +=
				'</p><p class = instruct-text>We are going to try practice again to see if you can achieve higher accuracy.  Remember: <br>' + getPromptTextList() +
				'</p><p class = instruct-text>When you are ready to continue, please press the spacebar.</p>'
			
			
			return true
		
		}
		
	}
}

/* ************************************ */
/*          Set up Experiment           */
/* ************************************ */

var n_back_single_task_network__practice_experiment = []

n_back_single_task_network__practice_experiment.push(motor_setup_block); //exp_input

//out of scanner practice
n_back_single_task_network__practice_experiment.push(intro_block);
n_back_single_task_network__practice_experiment.push(practiceNode1);
n_back_single_task_network__practice_experiment.push(practiceNode2);
n_back_single_task_network__practice_experiment.push(practice_feedback_block);
n_back_single_task_network__practice_experiment.push(practice_end_block);




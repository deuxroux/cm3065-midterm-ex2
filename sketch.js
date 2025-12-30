//global variables to track captcha and answers
let digitSounds= [];
let answer ; //captcha answer
let userAnswer = "";
let state = "awaiting_input";

//default challenge length: 4
let length = 4; 

//visualizer and noise modifiers vars
let bp, comp, rev, del, dist, finalGain, noise;

//player for audio playback
let player;

//UI
let fft;
let input;
let play, submit, generate;
let status,information; 


function preload(){
for (var d = 0; d<10; d++){
    fileStr = "assets/digits/"+d+".wav"
    digitSounds[d] = loadSound(fileStr);
}
console.log(digitSounds);

}

function setup(){
    createCanvas(600,350);
    background(180);
    answer = generate_challenge(length);
    init_effects();
    init_UI();
}

function draw(){

    draw_FFT(fft);

}

function generate_challenge(len){
    var challengeString = [];
    for(var i = 0; i <=len; i++){
        challengeString.push(floor(random(10))) //get a series of digits equal to len
    }
    return challengeString;
} 

function init_effects(){

    finalGain=new p5.Gain();
    //create a series of objects to distort the audio in the captcha from wav files
    bp = new p5.BandPass();
    comp = new p5.Compressor();
    dist = new p5.Distortion();
    del = new p5.Delay();
    rev = new p5.Reverb();
    noise = new p5.Noise('white')

    //create chain from scracth 
    bp.disconnect();
    comp.disconnect();
    dist.disconnect();
    del.disconnect();
    rev.disconnect();
    noise.disconnect();

    noise.connect(bp);
    bp.connect(comp);
    comp.connect(dist);
    dist.connect(rev);
    //del.connect(rev);
    rev.connect(finalGain);
    finalGain.connect();

}

function init_UI(){
    fft = new p5.FFT
    fft.setInput(finalGain);

    input = createInput("replace with response");
    input.size(200);
    input.position(50, 200);
    play = createButton('PLAY');
    play.position(50, 50);
    play.mousePressed(playCaptcha);
    submit=createButton('SUBMIT');
    submit.position(350,200)
    submit.mousePressed(check_answer);
    generate = createButton('REFRESH')
    generate.position(350,50);
    generate.mousePressed(() => {
        answer =generate_challenge(length);
      });
    status = createP("Status: ")
    status.position(50, 230);
    information= createP("Please play captcha and type in the digits that you hear, separating each by a comma.")
    information.position(10,0);
    


}

function randomize_audio(){
    noise.amp(random(0.01, 0.1));
    dist.set(random(0.01,0.05));
    comp.set(0.01,12,6,0.15) //determined to preserve inteligibility -- might not need. 
    rev.set(random(1.2, 3.0), random(1.5, 4.5));
    //del.process(finalGain, random(0.01, 0.01), random(0.1, 0.11), 5000); //params for delay
    finalGain.amp(1.5);
    noise.start();
}


function playCaptcha(){
    if(state== "playing") return;

    randomize_audio();
    state = "playing"

    //reset each tone and put into the input chain
    for (let d = 0; d <= 9; d++) {
        digitSounds[d].disconnect();
        digitSounds[d].connect(bp);
    }

    //play each token of the captcha
    let t = 0;
    for (let i = 0; i < answer.length; i++) {
        console.log(int(answer[i]))
      let digit = int(answer[i]);
      let gap = random(0.08, 0.18); //randomize time between tones
      digitSounds[digit].play(t);
      t += digitSounds[digit].duration() + gap;
    }
    console.log(answer);
  
    // stop noise after the last token
    setTimeout(() => {
      noise.amp(0, 0.05);
      state = "awaiting_verification";
    }, (t + 0.2) * 1000);
}

function check_answer(){
    userAnswer= input.value()
    console.log(userAnswer);
    console.log(answer.toString());
    if (userAnswer=="replace with response"){
        state = "awaiting_verification";
        status.html("Status: No input given. type each digit you hear above with comma between. ");


    }else if(userAnswer==answer.toString()){
        state = "success";
        status.html("Status: SUCCESS! Redirecting now... ");

    }else{
        state = "awaiting_verification";
        status.html("INCORRECT. PLEASE TRY AGAIN OR REFRESH TO HEAR ANOTHER.");
    }
}

function draw_FFT(fft, startX=100, startY=90, fftHeight = 100, fftWidth = 400){
    push();
    noStroke();
    fill(0);                
    rect(startX, startY, fftWidth, fftHeight);
    pop();
  
    // draw spectrum in draw loop
    let spectrum = fft.analyze();
    let barWidth = fftWidth / spectrum.length;
  
    push();
    noStroke();
    fill(255, 0, 0);
    translate(startX, startY);
  
    for (let i = 0; i < spectrum.length; i++){
      let x = i * barWidth;
      let h = map(spectrum[i], 0, 255, 0, fftHeight);
      rect(x, fftHeight, barWidth, -h); // negative draws upward
    }
  
    pop();
    }
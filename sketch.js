//global variables to track captcha and answers
let digitSounds= [];
let answer ; //captcha answer
let userAnswer = "";
let state = "inactive";

// let randomParams = {
//     freq:1200,
//     freqSpan: 1000,
//     q:8,
//     trem:6
// }

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
    fileStr = "assets/"+d+".wav"
    digitSounds[d] = loadSound(fileStr);
}
console.log(digitSounds);

}

function setup(){
    createCanvas(600,400);
    background(180);
    answer = generate_challenge(length);
    init_effects();
    init_UI();
}

function draw(){

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

    input = createInput("[replace with response]");
    input.size(200);
    input.position(50, 170);
    play = createButton('PLAY');
    play.position(50, 50);
    play.mousePressed(playCaptcha);
    submit=createButton('SUBMIT');
    submit.position(350,170)
    generate = createButton('REFRESH')
    generate.position(350,50);
    generate.mousePressed(generate_challenge(length));
    status = createP("Status: ")
    status.position(200, 200);
    information= createP("Please play captcha and type in the digits that you hear. Do not include commas or spaces.")
    information.position(10,0);
    


}

function randomize_audio(){
    noise.amp(random(0.01, 0.05));
    dist.set(random(0.001,0.01));
    comp.set(0.01,12,6,0.15) //determined to preserve inteligibility -- might not need. 
    rev.set(random(1.2, 3.0), random(1.5, 4.5));
    //del.process(finalGain, random(0.01, 0.01), random(0.1, 0.11), 5000); //params for delay
    finalGain.amp(16);
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
      state = "awaiting_input";
    }, (t + 0.2) * 1000);
}
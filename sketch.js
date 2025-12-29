//global variables to track captcha and answers
let digitSounds= [];
let userAnswer = "";
let state = "inactive";

//default challenge length: 4
let length = 4; 

//visualizer and noise modifiers vars
let bp, comp, rev, del, dist, outGain, noise, fft;

function preload(){
for (var d = 0; d<10; d++){
    fileStr = "assets/"+d+".wav"
    digitSounds[d] = loadSound(fileStr);
}

}

function setup(){
    createCanvas(600,400);
    background(180);
}

function draw(){

}

function generate_challenge(len){
    var challengeString = "";
    for(var i = 0; i <=len; i++){
        challengeString+=floor(random(10)) //get a series of digits equal to len
    }
    return challengeString
} 

function init_effects(){
    //create a series of objects to distort the audio in the captcha from wav files
    bp = new p5.BandPass();
    comp = new p5.Compressor();
    dist = new p5.Distortion();
    del = new p5.Delay();
    rev = new p5.Reverb();
    
    //create chain from scracth 
    bp.disconnect();
    comp.disconnect();
    dist.disconnect();
    del.disconnect();
    rev.disconnect();

    bp.connect(comp);
    comp.connect(dist);
    dist.connect(del);
    del.connect(rev);
    rev.connect();
}

function init_visualizer(){
    fft = new p5.FFT
}
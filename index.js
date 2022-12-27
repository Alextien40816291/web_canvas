const canvas = document.getElementById('canvas_id');
const ctx = canvas.getContext('2d');
let tool = "brush";
let is_drawing = false;
let is_typing = false;
let painting = false;
let pen_size = 10;
let fontSize = "20px";
let fontType = "Arial";
let x_down = 0;
let y_down = 0;
let x_move = 0;
let y_move = 0;
let x_up = 0;
let y_up = 0;
let tmpcanvas;
let auto_color_r = 0;
let auto_color_g = 150;
let auto_color_b = 0;
let save_state = 0;
let cur_state = -1;
let state_array = [];
var get_pen_size = document.getElementById("pen_range");
add_state();
get_pen_size.oninput = function(){
    pen_size = this.value;
}

function cursor(tool){
    canvas.style.cursor = `url(` + tool + `.svg), auto`;
}

canvas.addEventListener("mousedown", (e) => {
    is_drawing = true;
    x_down = e.offsetX;
    y_down = e.offsetY;
    if(save_state != 0){
        for(let i = 0; i < save_state-cur_state; i++) state_array.pop();
    }
    if (tool == "brush") simple_draw_func();
    else if (tool == "text" && (!is_typing)) text_func(e);
    else if(tool == "circle" || tool == "rectangle" || tool == "triangle" || tool == "line"){
        tmpcanvas = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
});

canvas.addEventListener("mousemove", (e) => {
    if(auto_color_r <= 100) auto_color_r = 255;
    else auto_color_r--;
    if(auto_color_g <= 100) auto_color_g = 255;
    else auto_color_g-=3;
    if(auto_color_b <=100) auto_color_b = 255;
    else auto_color_b-=2;
});
canvas.addEventListener("mousemove", (e) => {
    if(is_drawing){
        x_move = e.offsetX;
        y_move = e.offsetY;
        if(tool == "eraser") eraser_func(e);
        else if (tool == "brush") simple_draw_func();
        else if(tool == "colorful_brush") colorful_draw_func();
        else if(tool == "rectangle") rectangle_func();
        else if(tool == "triangle") triangle_func();
        else if(tool == "line") line_func();
        else if(tool == "circle") circle_func();
        else if(tool == "select_eraser") ctx.moveTo(e.offsetX, e.offsetY);;
    }   
});

canvas.addEventListener("mouseup", (e) => {
    is_drawing = false;
    x_up = e.offsetX;
    y_up = e.offsetY;
    if(tool == "select_eraser")ctx.clearRect(x_down, y_down, x_up-x_down, y_up-y_down);
    add_state();
}, false);

canvas.addEventListener("mouseenter", (e) => {
    cursor(tool);
    //add_state();
})

canvas.addEventListener("mouseout", (e) => {
    is_drawing = false;
  }, false);

document.getElementById("select_size").addEventListener("change", (e) => {
    fontSize = e.target.value;
});

document.getElementById("select_style").addEventListener("change", (e) => {
    fontType = e.target.value;
});


//ctx.strokeStyle = 'rgb(' + auto_color + ', ' + 255 + ', 0)';;
//colorful brush
function colorful_draw_func(){
    //simple drawing
    function startPosition(e){
        painting = true;
        draw(e);//fix drawing dot
    }

    function finishedPosition(){
        painting = false;
        ctx.beginPath();//fix connecting the last part
    }

    function draw(e){
        if(!painting || tool != "colorful_brush") return;
        else if(!is_drawing) return;
        ctx.lineWidth = pen_size;
        ctx.lineCap = "round";

        //ctx.strokeStyle = document.getElementById("favcolor").value;
        ctx.strokeStyle = 'rgb(' + auto_color_r + ', ' + auto_color_g + ','+  auto_color_b+ ')';;
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    }

        canvas.addEventListener("mousedown", startPosition);
        canvas.addEventListener("mouseup", finishedPosition);
        canvas.addEventListener("mousemove", draw);
    
}

//icon circle
function circle_func(){
    ctx.lineWidth = pen_size;
    ctx.strokeStyle= document.getElementById("favcolor").value;
    ctx.putImageData(tmpcanvas, 0, 0);
    ctx.beginPath();
    ctx.arc(x_down, y_down, Math.sqrt(Math.pow(x_move - x_down, 2) + Math.pow(y_move - y_down, 2)),0, 2*Math.PI);
    ctx.stroke();
}

//icon line
function line_func(){
    ctx.lineWidth = pen_size;
    ctx.strokeStyle= document.getElementById("favcolor").value;
    ctx.putImageData(tmpcanvas, 0, 0);
    ctx.beginPath();
    ctx.moveTo(x_down, y_down);
    ctx.lineTo(x_move, y_move);
    ctx.stroke();
}

//icon rectangle
function rectangle_func(){
    ctx.lineWidth = pen_size;
    ctx.strokeStyle= document.getElementById("favcolor").value;
    ctx.putImageData(tmpcanvas, 0, 0);
    ctx.beginPath();
    ctx.rect(x_down, y_down, x_move-x_down, y_move-y_down);
    ctx.stroke();
}

function triangle_func(){
    ctx.lineWidth = pen_size;
    ctx.strokeStyle= document.getElementById("favcolor").value;
    ctx.putImageData(tmpcanvas, 0, 0);
    ctx.beginPath();
    ctx.moveTo(x_down, y_down);
    ctx.lineTo(x_move,y_move);
    ctx.lineTo(2*x_down - x_move, y_move);
    ctx.closePath();
    ctx.stroke();
}

//icon text
function text_func(e){
    is_typing = true;
    
    let textArea = document.createElement('input');
    textArea.type = 'text';
    textArea.style.position = 'fixed';
    textArea.style.left = e.clientX + "px";
    textArea.style.top = e.clientY + "px";
    document.body.appendChild(textArea);
    document.addEventListener("keydown", key);
    function key(e){
        if (e.keyCode === 13) {
            is_typing = false;
            ctx.fillStyle = document.getElementById("favcolor").value;
            ctx.font = fontSize + " " + fontType;
            ctx.fillText(textArea.value, x_down, y_down);
            textArea.value = "";
            document.body.removeChild(textArea);
            add_state();
        }
    }    
}

//icon eraser
function eraser_func(e){
    ctx.moveTo(e.offsetX, e.offsetY);
    ctx.clearRect(e.offsetX, e.offsetY, pen_size, pen_size);
};

//icon simple drawing
function simple_draw_func(){
    //simple drawing
    function startPosition(e){
        painting = true;
        draw(e);//fix drawing dot
    }

    function finishedPosition(){
        painting = false;
        ctx.beginPath();//fix connecting the last part
    }

    function draw(e){
        if(!painting || tool != "brush") return;
        else if(!is_drawing) return;
        ctx.lineWidth = pen_size;
        ctx.lineCap = "round";

        ctx.strokeStyle = document.getElementById("favcolor").value;
        //ctx.strokeStyle = 'rgb(' + auto_color + ', ' + 255 + ', 0)';;
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    }

        canvas.addEventListener("mousedown", startPosition);
        canvas.addEventListener("mouseup", finishedPosition);
        canvas.addEventListener("mousemove", draw);
    
}

//downlod canvas to image(done)
function download(){
    image = canvas.toDataURL("image/png", 1.0).replace("image/png", "image/octet-stream");
    var link = document.createElement('a');
    link.download = "my-image.png";
    link.href = image;
    link.click();
}

//clear the canvas(done)
function clear_canvas(){
    ctx.clearRect(0,0,canvas.width, canvas.height);
}

function add_state(){
    let state = ctx.getImageData(0, 0, canvas.width, canvas.height);
    state_array.push(state);
    save_state = cur_state;
    save_state++;
    cur_state++;
    //console.log(cur_state);
}

function undo(){
    if(cur_state > 0){
        cur_state = cur_state - 1;
        ctx.putImageData(state_array[cur_state], 0, 0);
        console.log(cur_state);
    }      
}

function redo(){
    if(cur_state < save_state){
        cur_state = cur_state + 1;
        ctx.putImageData(state_array[cur_state], 0, 0);
        console.log(cur_state);
    } 
}

//upload image into canvas
document.getElementById("btn_upload").addEventListener("change", (e) =>{
    var reader = new FileReader();
    reader.onload = (event) =>{
        var img = new Image();
        img.src = event.target.result;
        img.onload = () => {ctx.drawImage(img,0,0);add_state();}
    }
    reader.readAsDataURL(e.target.files[0]);     
});

//window simple_drawing(To let don't need to choose function but already have simple draw function)
window.addEventListener("load", ()=>{
    function startPosition(e){
        painting = true;
        draw(e);//fix drawing dot
    }

    function finishedPosition(){
        painting = false;
        //add_state();
        ctx.beginPath();//fix connecting the last part
    }

    function draw(e){
        if(!painting || tool != "brush") return;
        else if(!is_drawing) return;
        ctx.lineWidth = pen_size;
        ctx.lineCap = "round";
        //ctx.strokeStyle= document.getElementById("favcolor").value;
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    }
        canvas.addEventListener("mousedown", startPosition);
        canvas.addEventListener("mouseup", finishedPosition);
        canvas.addEventListener("mousemove", draw);
});

function eraser(){
    tool = "eraser";
}

function simple_draw(){
    tool = "brush";
}

function text(){
    tool = "text";
}

function triangle(){
    tool = "triangle";
}

function rectangle(){
    tool = "rectangle";
}

function circle(){
    tool = "circle";
}

function straight_line(){
    tool = "line";
}

function select_eraser(){
    tool = "select_eraser";
}

function color_brush(){
    tool = "colorful_brush";
}
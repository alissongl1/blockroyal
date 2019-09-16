var quadrados = []
var colorShapeDoubleClick = getRandomColor ()

function Shape(i, x, y, w, h, c) {
    this.i = i || "2342h4h23kll"
    this.x = x || 0
    this.y = y || 0
    this.w = w || 1
    this.h = h || 1
    this.c = c || '#AAAAAA'
}

function Shape(quadrado) {
  this.i = quadrado.i || "2342h4h23kll"
  this.x = quadrado.x || 0
  this.y = quadrado.y || 0
  this.w = quadrado.w || 1
  this.h = quadrado.h || 1
  this.c = quadrado.c || '#AAAAAA'
}

// Draws this shape to a given context
Shape.prototype.draw = function(ctx) {
  ctx.fillStyle = this.c
  ctx.fillRect(this.x, this.y, this.w, this.h)
}

// Determine if a point is inside the shape's bounds
Shape.prototype.contains = function(mx, my) {
  // All we have to do is make sure the Mouse X,Y fall in the area between
  // the shape's X and (X + Width) and its Y and (Y + Height)
  return  (this.x <= mx) && (this.x + this.w >= mx) &&
          (this.y <= my) && (this.y + this.h >= my)
}

function CanvasState(canvas) {
  
  // **** First some setup! ****
  this.canvas = canvas
  this.width = canvas.width
  this.height = canvas.height
  this.ctx = canvas.getContext('2d')
  // This complicates things a little but but fixes mouse co-ordinate problems
  // when there's a border or padding. See getMouse for more detail
  var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop
  if (document.defaultView && document.defaultView.getComputedStyle) {
    this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0
    this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0
    this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0
    this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0
  }
  // Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
  // They will mess up mouse coordinates and this fixes that
  var html = document.body.parentNode
  this.htmlTop = html.offsetTop
  this.htmlLeft = html.offsetLeft

  // **** Keep track of state! ****
  this.valid = false // when set to false, the canvas will redraw everything
  this.shapes = []  // the collection of things to be drawn
  this.dragging = false // Keep track of when we are dragging
  this.draggingIdentity = "2342h4h23kll"
  // the current selected object. In the future we could turn this into an array for multiple selection
  this.selection = null
  this.dragoffx = 0 // See mousedown and mousemove events for explanation
  this.dragoffy = 0
  
  // **** Then events! ****
  // This is an example of a closure!
  // Right here "this" means the CanvasState. But we are making events on the Canvas itself,
  // and when the events are fired on the canvas the variable "this" is going to mean the canvas!
  // Since we still want to use this particular CanvasState in the events we have to save a reference to it.
  // This is our reference!
  var myState = this
  
  //fixes a problem where double clicking causes text to get selected on the canvas
  canvas.addEventListener('selectstart', function(e) { 
    console.log("selectStart")
    e.preventDefault() 
    return false }, 
  false)

  // Up, down, and move are for dragging
  canvas.addEventListener('mousedown', function(e) {
    console.log("mouseDown")
    var mouse = myState.getMouse(e)
    var mx = mouse.x
    var my = mouse.y
    var shapes = myState.shapes
    var l = shapes.length
    for (var i = l-1; i >= 0; i--) {
      if (shapes[i].contains(mx, my)) {
        var mySel = shapes[i]
        // Keep track of where in the object we clicked
        // so we can move it smoothly (see mousemove)
        myState.dragoffx = mx - mySel.x
        myState.dragoffy = my - mySel.y
        myState.dragging = true
        myState.draggingIdentity = shapes[i]["i"]
        myState.selection = mySel
        myState.valid = false
        return
      }
    }
    // havent returned means we have failed to select anything.
    // If there was an object selected, we deselect it
    if (myState.selection) {
      myState.selection = null
      myState.valid = false // Need to clear the old selection border
    }
  }, true)

  canvas.addEventListener('mousemove', function(e) {
    console.log("mouseMove")
    if (myState.dragging){
      var mouse = myState.getMouse(e)
      // We don't want to drag the object by its top-left corner, we want to drag it
      // from where we clicked. Thats why we saved the offset and use it here
      myState.selection.x = mouse.x - myState.dragoffx
      myState.selection.y = mouse.y - myState.dragoffy   
      myState.valid = false // Something's dragging so we must redraw
      
      var mx = mouse.x
      var my = mouse.y
      var shapes = myState.shapes
      var l = shapes.length
      for (var i = l-1; i >= 0; i--) {
        if (shapes[i].contains(mx, my)) {
          var quadrado = {}
          var keyQuadrado = shapes[i]["i"]
          console.log("valor da key ")
          console.log(keyQuadrado)
          quadrado[keyQuadrado + "/i"] = keyQuadrado
          quadrado[keyQuadrado + "/x"] = mouse.x - 10
          quadrado[keyQuadrado + "/y"] = mouse.y - 10
          quadrado[keyQuadrado + "/w"] = 20
          quadrado[keyQuadrado + "/h"] = 20
          quadrado[keyQuadrado + "/c"] = shapes[i]["c"]
          firebase.database().ref("quadrados/").update(quadrado)
          break
        }
      }
    }
  }, true)

  canvas.addEventListener('mouseup', function(e) {
    console.log("mouseUp")
    myState.dragging = false
    myState.draggingIdentity = ""
  }, true)

  // double click for making new shapes
  canvas.addEventListener('dblclick', function(e) {
    var mouse = myState.getMouse(e)
    var quadrado = {}
    console.log("valor de quadrado ")
    console.log(quadrado)
    //Ler e gravar dados no Firebase: https://firebase.google.com/docs/database/web/read-and-write?hl=pt-br
    var newQuadradoKey = firebase.database().ref("quadrados/").push().key
    console.log("valor da key ")
    console.log(newQuadradoKey)
    quadrado[newQuadradoKey + "/i"] = newQuadradoKey
    quadrado[newQuadradoKey + "/x"] = mouse.x - 10
    quadrado[newQuadradoKey + "/y"] = mouse.y - 10
    quadrado[newQuadradoKey + "/w"] = 20
    quadrado[newQuadradoKey + "/h"] = 20
    quadrado[newQuadradoKey + "/c"] = colorShapeDoubleClick
    console.log(quadrado)
    firebase.database().ref("quadrados/").update(quadrado)
  }, true)
  
  // **** Options! ****
  this.selectionColor = '#CC0000'
  this.selectionWidth = 2  
  this.interval = 30
  setInterval(function() { myState.draw() }, myState.interval)
}

CanvasState.prototype.addShape = function(shape) {
  this.shapes.push(shape)
  this.valid = false
}

CanvasState.prototype.removeShape = function(quadrado) {
  var i = 0;
  var shape = {}
  for(i = 0; i < this.shapes.length; i++){
    if(quadrado["i"] == this.shapes[i]["i"]){
      this.shapes.splice(i, 1)
      this.valid = false
      break
    }
  }
}

CanvasState.prototype.clear = function() {
  this.ctx.clearRect(0, 0, this.width, this.height)
}

// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
CanvasState.prototype.draw = function() {
  // if our state is invalid, redraw and validate!
  if (!this.valid) {
    var ctx = this.ctx
    var shapes = this.shapes
    this.clear()
    
    // ** Add stuff you want drawn in the background all the time here **
    // draw all shapes
    var l = shapes.length
    for (var i = 0; i < l; i++) {
      var shape = shapes[i]
      // We can skip the drawing of elements that have moved off the screen:
      if (shape.x > this.width || shape.y > this.height ||
          shape.x + shape.w < 0 || shape.y + shape.h < 0) continue
      shapes[i].draw(ctx)
    }
    
    // draw selection
    // right now this is just a stroke along the edge of the selected Shape
    if (this.selection != null) {
      ctx.strokeStyle = this.selectionColor
      ctx.lineWidth = this.selectionWidth
      var mySel = this.selection
      ctx.strokeRect(mySel.x,mySel.y,mySel.w,mySel.h)
    }
    
    // ** Add stuff you want drawn on top all the time here **
    this.valid = true
  }
}


// Creates an object with x and y defined, set to the mouse position relative to the state's canvas
// If you wanna be super-correct this can be tricky, we have to worry about padding and borders
CanvasState.prototype.getMouse = function(e) {
  var element = this.canvas, offsetX = 0, offsetY = 0, mx, my
  
  // Compute the total offset
  if (element.offsetParent !== undefined) {
    do {
      offsetX += element.offsetLeft
      offsetY += element.offsetTop
    } while ((element = element.offsetParent))
  }

  // Add padding and border style widths to offset
  // Also add the <html> offsets in case there's a position:fixed bar
  offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft
  offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop

  mx = e.pageX - offsetX
  my = e.pageY - offsetY
  
  // We return a simple javascript object (a hash) with x and y defined
  return {x: mx, y: my}
}

function init() {
  var s = new CanvasState(document.getElementById('canvas1'))
  firebase.database().ref('quadrados/').on('value', function (snapshot) {
      // console.log("Lista de quadrados recebidos do Firebase")
      // console.log(snapshot.val())
      snapshot.forEach(function(item) {
        var q = item.val()
        var showQuadrado = true
        for(var i = 0; i < quadrados.length; i++){
          if(q["i"] == quadrados[i]["i"]){
            if(q["x"] == quadrados[i]["x"] && q["y"] == quadrados[i]["y"]){ //não se movimentou
              showQuadrado = false
            }else if(s.dragging && s.draggingIdentity == q["i"]){ // se movimentou mas no cliente
              showQuadrado = false // apenas o mousemove que movimentará o quadrado no cliente
            }else{ // se movimentou no servidor, logo deve se movimentar aqui
              s.removeShape(q)
              quadrados[i] = q
              showQuadrado = true
            }
          }
        }
        if(showQuadrado){
          quadrados.push(q)
          s.addShape(new Shape(q))  
        }
      })
      // console.log("Array de quadrados criados no Javascript")
      // console.log(quadrados)
    }
  )
}

//Procurando no Google por: random color javascript
//no primeiro resultado é apresentada uma resposta no fórum internacional StackOverFlow
function getRandomColor() {
  var letters = '0123456789ABCDEF'
  var color = '#'
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}
// 创建一个Phaser游戏实例，设置游戏窗口大小为480x320，使用Phaser.AUTO模式，即自动选择最适合的渲染方式，游戏内容将放置在null指定的位置，游戏内容包含preload、create、update三个函数
var game = new Phaser.Game(480, 320, Phaser.AUTO, null, {preload: preload, create: create, update: update});

// 定义游戏中的元素
var ball;//定义一个小球
var paddle;//定义挡板
var bricks;//定义砖块
var newBrick;//定义一个新的砖块
var brickInfo;//定义砖块信息
var scoreText;//设置分数文本
var score = 0;//设置分数为0
var lives = 3;//设置生命为3个
var livesText;//设置生命文本
var lifeLostText;//设置生命丢失文本，即生命发生减少后出现的文本
var playing = false;//设置游戏是否在运行
var startButton;//设置开始按钮

// 预加载游戏资源
function preload() {
    
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;// 设置游戏缩放模式为SHOW_ALL，即游戏内容将填充整个屏幕
    
    game.scale.pageAlignHorizontally = true;// 设置游戏内容在水平方向上居中对齐
    
    game.scale.pageAlignVertically = true;// 设置游戏内容在垂直方向上居中对齐
   
    game.stage.backgroundColor = '#eee'; // 设置游戏背景颜色为#eee
    // 加载游戏资源
    game.load.image('paddle', 'img/paddle.png');//加载挡板图片
    game.load.image('brick', 'img/brick.png');// 加载砖块图片
    game.load.spritesheet('ball', 'img/wobble.png', 20, 20);// 加载球体图片
    game.load.spritesheet('button', 'img/button.png', 120, 40);// 加载按钮图片
}
// 创建游戏内容
function create() {
    
    game.physics.startSystem(Phaser.Physics.ARCADE);// 启动物理引擎系统
   
    game.physics.arcade.checkCollision.down = false; // 设置物理系统不检测球体与底部碰撞
    
    ball = game.add.sprite(game.world.width*0.5, game.world.height-25, 'ball');// 在画布上创建出这个球体
    // 添加球体动画
    ball.animations.add('wobble', [0,1,0,2,0,1,0,2,0], 24);
    
    ball.anchor.set(0.5);// 设置球体坐标为(0.5,0.5)
    
    game.physics.enable(ball, Phaser.Physics.ARCADE);// 启用物理引擎系统
    
    ball.body.collideWorldBounds = true;// 设置球体与边界碰撞
    
    ball.body.bounce.set(1);// 设置球体碰到画布边界会发生反弹
    // 设置球体离开屏幕时触发事件
    ball.checkWorldBounds = true;
    ball.events.onOutOfBounds.add(ballLeaveScreen, this);

    
    paddle = game.add.sprite(game.world.width*0.5, game.world.height-5, 'paddle');// 创建挡板
    
    paddle.anchor.set(0.5,1);// 设置挡板锚点为(0.5,1)
    
    game.physics.enable(paddle, Phaser.Physics.ARCADE);// 启用物理引擎系统
  
    paddle.body.immovable = true;  // 设置挡板不可移动

    
    initBricks();// 初始化砖块

    
    textStyle = { font: '18px Arial', fill: '#0095DD' };// 设置文本的样式
    
    scoreText = game.add.text(5, 5, 'Points: 0', textStyle);// 创建分数文本
    
    livesText = game.add.text(game.world.width-5, 5, 'Lives: '+lives, textStyle);// 创建生命值文本
    
    livesText.anchor.set(1,0);// 设置生命值文本锚点为(1,0)
   
    lifeLostText = game.add.text(game.world.width*0.5, game.world.height*0.5, 'Life lost, tap to continue', textStyle); // 创建生命丢失文本
    
    lifeLostText.anchor.set(0.5);// 设置生命丢失文本锚点为(0.5)
    
    lifeLostText.visible = false;// 设置生命丢失文本不可见

    // 创建开始按钮
    startButton = game.add.button(game.world.width*0.5, game.world.height*0.5, 'button', startGame, this, 1, 0, 2);
    // 设置开始按钮锚点为(0.5)
    startButton.anchor.set(0.5);
}
// 更新游戏内容
function update() {
    // 检测球体与挡板碰撞
    game.physics.arcade.collide(ball, paddle, ballHitPaddle);
    // 检测球体与砖块碰撞
    game.physics.arcade.collide(ball, bricks, ballHitBrick);
    // 如果游戏正在进行中
    if(playing) {
        // 设置挡板位置为鼠标位置
        paddle.x = game.input.x || game.world.width*0.5;
    }
}
// 初始化砖块
function initBricks() {
    // 设置砖块信息
    brickInfo = {
        width: 50,
        height: 20,
        count: {
            row: 7,
            col: 3
        },
        offset: {
            top: 50,
            left: 60
        },
        padding: 10
    }
    // 创建砖块组
    bricks = game.add.group();
    // 循环创建砖块
    for(c=0; c<brickInfo.count.col; c++) {
        for(r=0; r<brickInfo.count.row; r++) {
            // 计算砖块位置
            var brickX = (r*(brickInfo.width+brickInfo.padding))+brickInfo.offset.left;
            var brickY = (c*(brickInfo.height+brickInfo.padding))+brickInfo.offset.top;
            // 创建砖块
            newBrick = game.add.sprite(brickX, brickY, 'brick');
            // 启用物理系统
            game.physics.enable(newBrick, Phaser.Physics.ARCADE);
            // 设置砖块不可移动
            newBrick.body.immovable = true;
            // 设置砖块锚点为(0.5)
            newBrick.anchor.set(0.5);
            // 将砖块添加到砖块组
            bricks.add(newBrick);
        }
    }
}
// 球体击中砖块
function ballHitBrick(ball, brick) {
    // 创建砖块消失动画
    var killTween = game.add.tween(brick.scale);
    killTween.to({x:0,y:0}, 200, Phaser.Easing.Linear.None);
    // 设置动画完成后销毁砖块
    killTween.onComplete.addOnce(function(){
        brick.kill();
    }, this);
    // 启动动画
    killTween.start();
    score += 10;
    scoreText.setText('Points: '+score);
    // 更新分数文本
    if(score === brickInfo.count.row*brickInfo.count.col*10) {
    // 如果分数达到目标分数
        alert('You won the game, congratulations!');
        location.reload();
    }
}
function ballLeaveScreen() {
    lives--;
    if(lives) {// 如果生命值大于0

        livesText.setText('Lives: '+lives);// 更新生命值文本
        lifeLostText.visible = true;// 设置生命丢失文本可见
        ball.reset(game.world.width*0.5, game.world.height-25);// 重置球体位置
    
        paddle.reset(game.world.width*0.5, game.world.height-5);// 重置挡板位置
        
        game.input.onDown.addOnce(function(){// 监听鼠标点击事件
        
            lifeLostText.visible = false;// 设置生命丢失文本不可见
        
            ball.body.velocity.set(150, -150);// 设置球体速度
        
        }, this);
        
    }
            
    else {
            
        alert('You lost, game over!');//  如果生命值等于0，弹出失败提示
        location.reload();// 重新加载页面
    }
    
}
        // 球体击中挡板
function ballHitPaddle(ball, paddle) {
        
    ball.animations.play('wobble');// 播放球体动画
    ball.body.velocity.x = -1*5*(paddle.x-ball.x);// 设置球体速度
}

function startGame() {// 开始游戏
    
    startButton.destroy(); // 销毁开始按钮
    
    ball.body.velocity.set(150, -150);// 设置球体速度
    playing = true;}// 设置游戏进行中
   
    
    

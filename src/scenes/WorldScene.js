export class WorldScene extends Phaser.Scene {

    constructor() {
        super('WorldScene');
    }

    preload() {
        
    }

    create() {
        var map = this.make.tilemap({key: 'map'});

        var tileset = map.addTilesetImage('spritesheet', 'tiles');

        var grass = map.createLayer('Grass', tileset, 0, 0);
        var obstacles = map.createLayer('Obstacles', tileset, 0, 0);
        obstacles.setCollisionByExclusion([-1]);
        

        this.player = this.physics.add.sprite(50, 100, 'player', 6);

        this.physics.world.bounds.width = map.widthInPixels;
        this.physics.world.bounds.height = map.heightInPixels;
        this.player.setCollideWorldBounds(true);

        this.physics.add.collider(this.player, obstacles);

        this.cursors = this.input.keyboard.createCursorKeys();

        // ограничиваем камеру размерами карты
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        // заставляем камеру следовать за игроком
        this.cameras.main.startFollow(this.player);
        //своего рода хак, чтобы предотвратить пояление полос в тайлах
        this.cameras.main.roundPixels = true;

        // анимация клавиши 'left' для персонажа
         // мы используем одни и те же спрайты для левой и правой клавиши, просто зеркалим их
         this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { frames: [1, 7, 1, 13]}),
            frameRate: 10,
            repeat: -1
        });
 
        // анимация клавиши 'right' для персонажа 
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { frames: [1, 7, 1, 13] }),
            frameRate: 10,
           repeat: -1
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', { frames: [2, 8, 2, 14]}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', { frames: [ 0, 6, 0, 12 ] }),
            frameRate: 10,
            repeat: -1
        });

        this.spawns = this.physics.add.group({ classType: Phaser.GameObjects.Zone });
        for(var i = 0; i < 30; i++) {
            var x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
            var y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
            // параметры: x, y, width, height
            this.spawns.create(x, y, 20, 20);            
        }        
        this.physics.add.overlap(this.player, this.spawns, this.onMeetEnemy, false, this);

    }

    update(){
        this.player.body.setVelocity(0);
 
        // горизонтальное перемещение
        if (this.cursors.left.isDown)
        {
            this.player.body.setVelocityX(-80);
        }
        else if (this.cursors.right.isDown)
        {
            this.player.body.setVelocityX(80);
        }
 
        // вертикальное перемещение
        if (this.cursors.up.isDown)
        {
            this.player.body.setVelocityY(-80);
        }
        else if (this.cursors.down.isDown)
        {
            this.player.body.setVelocityY(80);
        }

        // В конце обновляем анимацию и устанавливаем приоритет анимации
        // left/right над анимацией up/down 
        if (this.cursors.left.isDown)
        {
            this.player.anims.play('left', true);
            this.player.flipX = true; //Разворачиваем спрайты персонажа вдоль оси X
        }
        else if (this.cursors.right.isDown)
        {
            this.player.anims.play('right', true);
            this.player.flipX = false; //Отменяем разворот спрайтов персонажа вдоль оси X
        }
        else if (this.cursors.up.isDown)
        {
            this.player.anims.play('up', true);
        }
        else if (this.cursors.down.isDown)
        {
            this.player.anims.play('down', true);
        }
        else
        {
            this.player.anims.stop();
        }  
    }
    
    onMeetEnemy(player, zone){
        // мы перемещаем зону в другое место
        zone.x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
        zone.y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);

        // встряхиваем мир       
        this.cameras.main.shake(300);

        // начало боя  
        this.scene.switch('BattleScene');
    }
}
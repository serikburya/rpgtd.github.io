export class BattleScene extends Phaser.Scene {

    constructor() {
        super('BattleScene');
    }

    create() {
        // меняем фон на зеленый
        this.cameras.main.setBackgroundColor('rgba(0, 200, 0, 0.5)');
 
        this.startBattle();

        this.sys.events.on('wake', this.wake, this);
    }

    nextTurn() { 
        //проверяем не настал ли уже проигрыш или победа
        if(this.checkEndBattle()) {           
        this.endBattle();
            return;
        } 

        do {
            this.index++;
            // если юнитов больше нет, то начинаем сначала с первого
            if(this.index >= this.units.length) {
                this.index = 0;
            }
        } 
        while(!this.units[this.index].living);
        // если это герой игрока
        if(this.units[this.index] instanceof PlayerCharacter) {                
            this.events.emit("PlayerSelect", this.index);
        } else { // иначе если это юнит врага
            // выбираем случайного героя
            var r;
            do {
                r = Math.floor(Math.random() * this.heroes.length);
            } while(!this.heroes[r].living) 
            // и вызываем функцию атаки юнита врага 
            this.units[this.index].attack(this.heroes[r]);  
            // добавляем задержку на следующий ход, чтобы был плавный игровой процесс
            this.time.addEvent({ delay: 1000, callback: this.nextTurn, callbackScope: this });
        }
    }

    receivePlayerSelection(action, target) {
        if(action == 'attack') {            
            this.units[this.index].attack(this.enemies[target]);              
        }
        this.time.addEvent({ delay: 500, callback: this.nextTurn, callbackScope: this });        
    }

    wake() {
        this.scene.run('UIScene');  
        this.time.addEvent({delay: 500, callback: this.endBattle, callbackScope: this}); 
        this.cursors.left.reset();
        this.cursors.right.reset();
        this.cursors.up.reset();
        this.cursors.down.reset();       
    }

    //проверка на проигрыш или победу
    checkEndBattle() {        
        var victory = true;
        // если все враги умерли - мы победили
        for(var i = 0; i < this.enemies.length; i++) {
            if(this.enemies[i].living)
                victory = false;
        }
        var gameOver = true;
        // если все герои умерли - мы проиграли
        for(var i = 0; i < this.heroes.length; i++) {
            if(this.heroes[i].living)
                gameOver = false;
        }
        return victory || gameOver;
    }

    endBattle() {       
        // очищаем состояния, удаляем спрайты
        this.heroes.length = 0;
        this.enemies.length = 0;
        for(var i = 0; i < this.units.length; i++) {
            // ссылки на экземпляры юнитов
            this.units[i].destroy();            
        }
        this.units.length = 0;
        // скрываем UI
        this.scene.sleep('UIScene');
        // возвращаемся в WorldScene и скрываем BattleScene
        this.scene.switch('WorldScene');
    }

    startBattle() {
         // персонаж игрока - warrior (воин)
        var warrior = new PlayerCharacter(this, 250, 50, 'player', 1, 'Воин', 100, 20);        
        this.add.existing(warrior);
 
        // персонаж игрока - mage (маг)
        var mage = new PlayerCharacter(this, 250, 100, 'player', 4, 'Маг', 80, 8);
        this.add.existing(mage);            
 
        var dragonblue = new Enemy(this, 50, 50, 'dragonblue', null, 'Дракон', 50, 3);
        this.add.existing(dragonblue);
 
        var dragonOrange = new Enemy(this, 50, 100, 'dragonorrange', null,'Дракон2', 50, 3);
        this.add.existing(dragonOrange);
 
         // массив с героями
        this.heroes = [ warrior, mage ];
        // массив с врагами
        this.enemies = [ dragonblue, dragonOrange ];
        // массив с обеими сторонами, которые будут атаковать
        this.units = this.heroes.concat(this.enemies);
 
        // Одновременно запускаем сцену UI Scene 
        this.scene.launch('UIScene');
 
        this.index = -1; // текущий активный юнит     
    }
}

var Unit = new Phaser.Class({
    Extends: Phaser.GameObjects.Sprite,
 
    initialize:
 
    function Unit(scene, x, y, texture, frame, type, hp, damage) {
        Phaser.GameObjects.Sprite.call(this, scene, x, y, texture, frame)
        this.type = type;
        this.maxHp = this.hp = hp;
        this.damage = damage; // урон по умолчанию
        this.living = true;         
        this.menuItem = null;                
    },
    // мы будем использовать эту функцию, чтобы установить пункт меню, когда юнит умирает
    setMenuItem: function(item) {
        this.menuItem = item;
    },
    // атака целевого юнита
    attack: function(target) {
        if(target.living) {
            target.takeDamage(this.damage);
            this.scene.events.emit("Message", this.type + " атакует " + target.type + " с " + this.damage + " уроном");
        }
    },    
    takeDamage: function(damage) {
        this.hp -= damage;
        if(this.hp <= 0) {
            this.hp = 0;
            this.menuItem.unitKilled();
            this.living = false;
            this.visible = false;   
            this.menuItem = null;
        }
    }    
});

var Enemy = new Phaser.Class({
    Extends: Unit,
 
    initialize:
    function Enemy(scene, x, y, texture, frame, type, hp, damage) {
        Unit.call(this, scene, x, y, texture, frame, type, hp, damage);
    }
});

var PlayerCharacter = new Phaser.Class({
    Extends: Unit,
 
    initialize:
    function PlayerCharacter(scene, x, y, texture, frame, type, hp, damage) {
        Unit.call(this, scene, x, y, texture, frame, type, hp, damage);
        // зеркально развернем изображение, чтобы не править его в ручную
        this.flipX = true;
 
        this.setScale(2);
    }
});

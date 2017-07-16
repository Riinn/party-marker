const Command = require('command')

module.exports = function marker(dispatch) {
    const command = Command(dispatch)
    
const red = 0,
    yellow = 1,
    blue = 2,
    heal_color = yellow,
    dps_color = blue,
    tank_color = red;
    
let enabled = null,
    tomark = null,
    leaderID = null,
    playerID = null,
    dead = [],
    heal = [],
    dps = [],
    tank = [],
    tank_heal = [],
    all = [];
    
    command.add('mark', (arg) => {
            if(playerID != leaderID){
                command.message('Cannot Mark, Require Lead!')
                return;
            }
            if(arg === 'all'){
                enabled = true;
                tomark = all;
                command.message('Marked all');
            }
            else if(arg ===  'tank+heal' || arg ===  'heal+tank'){
                enabled = true;
                tomark = tank_heal;
                command.message('Marked Tank and Heal');
            }
            else if(arg ===  'heal'){
                enabled = true;
                tomark = heal;
                command.message('Marked Heal');
            }
            else if(arg ===  'tank'){
                enabled = true;
                tomark = tank;
                command.message('Marked Tank');
            }
            else if(arg ===  'dps'){
                enabled = true;
                tomark = dps;
                command.message('Marked DPS');
            }
            else if(arg ===  'off'){
                tomark = [];
                mark(tomark);
                enabled = false;
                command.message('Marks Removed')
            }
            enabled ? command.message('Auto Mark Enabled') : command.message('Auto Mark Disabled') 
            if(tomark.length != 0) mark(tomark);
    });
    
    dispatch.hook('S_LOGIN', 2, (event) => {	
		playerID = event.playerId;
    });

    dispatch.hook('S_PARTY_MEMBER_LIST', 5, event => {
        leaderID = event.leaderPlayerId;
            for (let x in event.members){
                if(event.members[x].class == 6 || event.members[x].class == 7) heal.push({color: heal_color, target: event.members[x].cid});
                else if(event.members[x].class == 1 || event.members[x].class == 10) tank.push({color: tank_color, target: event.members[x].cid});
                else dps.push({color: dps_color, target: event.members[x].cid});
            }
            list = [];
            tank_heal = heal.concat(tank);
            all = tank_heal.concat(dps);
    });
    
    dispatch.hook('S_CHANGE_PARTY_MANAGER', 1, event => {
        leaderID = event.target.high;
    });
    
    dispatch.hook('S_PARTY_MEMBER_STAT_UPDATE', 2, (event) => {
		if (!enabled) return;
        if(event.curHp == 0 && !dead.includes(event.playerId)){
            dead.push(event.playerId)
        }
        if(event.curHp > 0 && dead.includes(event.playerId)){
            let index = dead.indexOf(event.playerId);
            dead.splice(index, 1);
            mark(tomark);
        }
	});

    function mark(marks){
            dispatch.toServer('C_PARTY_MARKER', 1, {
                markers: marks
              });
    }
};
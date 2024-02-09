// ==UserScript==
// @name         test
// @namespace    http://tampermonkey.net/
// @version      0.12
// @description  Automatic trigger key
// @author       Sammy
// @match        https://www.google.com/
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

// data structure: keycode timeout
const magical_range = 2000 // your MP range
const constant_skill = 300 * 1000 // 300s
const constant_value = 70 // Average consume MP: 70
// keycode, timeout, keyname ,value, alt flag
const skill_key = [
    ['F1', constant_skill, constant_value], //
    ['F2', constant_skill, constant_value], //
    ['3', constant_skill, constant_value], // 3
    ['4', constant_skill, constant_value], // 4
    ['5', constant_skill, constant_value], // 5
    ['6', constant_skill, constant_value], // 6
    ['7', constant_skill, constant_value], // 7
    ['8', constant_skill, constant_value], // 8
    ['9', constant_skill, constant_value], // 9
    ['0', constant_skill, constant_value], // 0
];

function fireKeyEvent(el, evtType, ikey, altflag) {
    //   event.initEvent(evtType, true, false)
    //   event = Object.assign(event, {
    //       ctrlKey: false,
    //       metaKey: false,
    //       altKey: altflag,
    //       which: ikeyCode,
    //       keyCode: ikeyCode,
    //       key: ikey,
    //       code: ikey
    //   })
    el.dispatchEvent(new KeyboardEvent(evtType, { key: ikey}));
}


function getRandomInt(max) {
  return Math.floor((Math.random(new Date().getTime()) - 0.5) * max) ;
}

function get10factor(x) {
  return Math.floor(Math.log(x) / Math.log(10));
}
function resettime() {
    const numRows = skill_key.length;
    let array = []; // target_time, count
    for(let i = 0; i < numRows; i++) {
        let interval = skill_key[i][1];
        array[i] = [];
        array[i][0] = interval + getRandomInt(1000);
        array[i][1] = new Date().getTime();

    }
    return array;
}
function skill_cb(el, args2) {
    fireKeyEvent(el,'keydown', args2);
    fireKeyEvent(el,'keyup', args2);
}

function CreateButton(name , localx, localy)
{
    var button = document.createElement('button');
    button.innerHTML = name;
    button.style.width = '100px'; // 設置寬度為 100 像素
    button.style.height = '50px'; // 設置高度為 50 像素
    button.style.opacity = 1; // 設置透明度為 0.8
    button.style.position = 'absolute'; // 設置按鈕的位置為絕對定位
    button.style.top = localx; // 設置按鈕的上方距離為畫面的一半
    button.style.left = localy; // 設置按鈕的左側距離為畫面的一半
    button.style.backgroundColor = 'black'; // 設置背景顏色
    button.style.color = 'white'; // 設置文字顏色為白色

    return button;
}
(function() {
    'use strict';
    // Your code here...
    var sp_time = 2010; // 2010 ms for skill response
    var variable_skill = 1000 // 2s
    var heal_mode = 0;
    var heal_time = 500;
    var StartFlag = false;
    var heal_flag = false;

    // 創建一個按鈕元素
    const b_support = CreateButton('AutoSupport', '80%', '90%');
    const b_health = CreateButton('HealMode', '75%', '90%');

    b_health.addEventListener('click', function() {
       if(heal_mode == 0) {
           this.textContent = 'Stopheal';
           heal_mode++;
           heal_flag = false;
       } else if (heal_mode == 1){
           this.textContent = 'Slowheal';
           variable_skill = 3500;
           heal_flag = true;
            heal_mode++;
       } else if (heal_mode == 2){
           this.textContent = 'Normalheal';
           variable_skill = 2500;
           heal_flag = true;
           heal_mode++;
       } else {
           this.textContent = 'Burstheal';
           variable_skill = 1000;
           heal_flag = true;
           heal_mode = (heal_mode >= 3)? 0 : heal_mode;
       }
    });

    b_support.addEventListener('click', function() {
       if(StartFlag) {
           this.textContent = 'StopSupport';
           StartFlag = false;
       } else {
           this.textContent = 'StartSupport';
           StartFlag = true;

       }
    });
    // 將按鈕添加到 HTML 文檔中的 body 元素中
    document.body.appendChild(b_support);
    document.body.appendChild(b_health);

    const numRows = skill_key.length;
    let count_timeout = resettime();
    var first_discharge = true;
    let heal_timeout = [variable_skill, new Date().getTime()];
    let magical_cap = 0;
    let sp_skill_idx = 0;
    let sp_discharge = true;
    let init_sp_skill = false;
    const canvas_tmp = document.querySelector('#canvas');

    setInterval(function(){
        var current_time = new Date().getTime();
        if(!StartFlag) {
            first_discharge = true;
            return;
        }
        if (first_discharge) {
            count_timeout = resettime();
            first_discharge = false;
            sp_discharge = false;
            init_sp_skill = true;
            sp_skill_idx = 0;
            magical_cap = magical_range;
        }
        if ((current_time - count_timeout[sp_skill_idx][1]) > count_timeout[sp_skill_idx][0] || init_sp_skill) {

            //skill_cb(canvas_tmp, skill_key[sp_skill_idx][0]);
           // skill_cb(canvas_tmp, 'z');

            if(init_sp_skill)
            {
                if(skill_key[sp_skill_idx][0] == '0')
                {
                    init_sp_skill = false;
                    sp_discharge = true;
                }
            }
            else
            {
                let interval = skill_key[sp_skill_idx][1];
                count_timeout[sp_skill_idx][0] = interval + getRandomInt(20000);
                count_timeout[sp_skill_idx][1] = current_time;
                sp_discharge = false;
            }
            magical_cap += skill_key[sp_skill_idx][2];
        }
        else
        {
            sp_discharge = true;
        }
        sp_skill_idx = (sp_skill_idx >= numRows - 1) ? 0 : ++sp_skill_idx;
    }, sp_time);
        // for heal!!
    setInterval(function(){
        var current_time = new Date().getTime();
         if(!StartFlag) {
            return;
        }
        if ((magical_range - magical_cap) < 200 && sp_discharge && heal_flag) {
            // 補魔1 49
            //skill_cb(canvas_tmp, '1');
            magical_cap = 0;
        } else if ((current_time - heal_timeout[1]) > heal_timeout[0] && sp_discharge && heal_flag) {

            heal_timeout[0] = variable_skill + getRandomInt(1000);
            heal_timeout[1] = current_time;
            console.log("heal+timeout: " , heal_timeout[0]);
            //skill_cb(canvas_tmp, '2');
            magical_cap += 19;
        }
    }, heal_time);
})();
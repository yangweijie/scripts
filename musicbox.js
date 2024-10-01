// ==UserScript==
// @name         网易云音乐链接提交到MusicBox
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  在网易云音乐歌曲页面右击链接时添加"提交到MusicBox"菜单
// @match        https://music.163.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @connect      musicbox.yangweijie.cn
// ==/UserScript==

(function() {
    'use strict';

    let menuItem;
    let isSubmitting = false; // 添加一个标志位
    let m163_domain = 'https://music.163.com';

    // 添加右键菜单
    document.addEventListener('contextmenu', function(e) {
        console.log(e.target);
        let songUrl = '';
        let pageX = e.pageX;
        let pageY = e.pageY;
        let songText = '';
        let songId = 0;
        if(e.target.tagName=== 'B'){
            e.preventDefault();
            let parentElement = e.target.parentElement;
            songUrl = parentElement.href;
            console.log(songUrl);
            if(songUrl.indexOf('http')=== -1){
                songUrl = m163_domain+songUrl;
            }
            console.log(songUrl);
            songText = parentElement.textContent;
            songId = songUrl.match(/id=(\d+)/)[1];
        }
        if (e.target.tagName === 'A' && e.target.href.match(/\/song\?id=\d+/)) {
            e.preventDefault();
            songUrl = e.target.href;
            console.log(songUrl);
            if(songUrl.indexOf('http')=== -1){
                songUrl = m163_domain+songUrl;
            }
            console.log(songUrl);
            songText = e.target.textContent;
            songId = songUrl.match(/id=(\d+)/)[1];
        }
        dealContextMenu(songUrl, songText, songId, pageX, pageY);
    });

    // 点击链接之外的区域时，移除菜单
    document.addEventListener('click', function(e) {
        if (menuItem && (!e.target.matches('div') || e.target !== menuItem)) {
            document.body.removeChild(menuItem);
            menuItem = null;
        }
    });

    function dealContextMenu(songUrl,songText, songId,x, y){
        if (menuItem) {
                document.body.removeChild(menuItem);
            }

            menuItem = document.createElement('div');
            menuItem.textContent = '提交到MusicBox';
            menuItem.style.cssText = 'position:absolute;background:white;border:1px solid black;padding:5px;cursor:pointer;';
            menuItem.style.left = x + 'px';
            menuItem.style.top = y + 'px';

            menuItem.onclick = function() {
                if (isSubmitting) return; // 如果正在提交，直接返回
                isSubmitting = true; // 设置标志位为true

                const confirmMessage = `确认提交链接: ${songText} - ${songId} 到 MusicBox 吗？`;
                if (confirm(confirmMessage)) {
                    submitToMusicBox(songUrl);
                } else {
                    isSubmitting = false; // 如果取消提交，重置标志位
                }
                document.body.removeChild(menuItem);
                menuItem = null;
            };

            document.body.appendChild(menuItem);
    }

    // 提交到MusicBox的函数
    function submitToMusicBox(url) {
        GM_xmlhttpRequest({
            method: "POST",
            url: "https://musicbox.yangweijie.cn/submit",
            data: JSON.stringify({
                url: url,
                json: 1
            }),
            headers: {
                "Content-Type": "application/json",
            },
            onload: function(response) {
                console.log(response);
                if (response.status === 200) {
                    console.log("提交成功");
                } else {
                    alert("提交失败1");
                }
                isSubmitting = false; // 提交完成后重置标志位
            },
            onerror: function(error) {
                alert("提交失败2：" + error);
                isSubmitting = false; // 提交失败后重置标志位
            }
        });
    }
})();

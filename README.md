# slack-slasher

슬랙 슬래시 커멘드를 받으면 "뭔가" 하도록 만든다

## "뭔가"가 뭔데

1. 슬랙 채널에서 디버그 정보 요청시 리퀘스트 정보를 채널메시지로 보낸다.
2. Dice 명령어로 주사위 굴리기 쿼리를 보내면 중간 과정과 결과값을 보낸다.

## 개발과정

1. [Glitch]에서 제공하는 IDE를 이용해 개발한다.
1.1. 코드를 수정하면 몇초 내로 서버에 반영되고 슬랙을 기능을 확인할 수 있다.
1.2. 서버를 사용하지 않으면 sleep상태로 변환되고 요청시 자동으로 wakeup 된다.
2. [Github] 저장소를 통해 이슈, 버전관리를 한다.
2.1. [Glitch]에서 제공하는 export 툴을 이용해 [Github] 저장소의 'glitch' branch에 commit할 수 있다.
2.2. [Github]에서 PR 만들고 master에 merge 한다.

## Your Project

On the front-end,

- Edit `views/index.html` to change the content of the webpage
- `public/client.js` is the javacript that runs when you load the webpage
- `public/style.css` is the styles for `views/index.html`
- Drag in `assets`, like images or music, to add them to your project

On the back-end,

- your app starts at `server.js`
- add frameworks and packages in `package.json`
- safely store app secrets in `.env` (nobody can see this but you and people you invite)

Click `Show` in the header to see your app live. Updates to your code will instantly deploy.


## Made by [Glitch](https://glitch.com/)

**Glitch** is the friendly community where you'll build the app of your dreams. Glitch lets you instantly create, remix, edit, and host an app, bot or site, and you can invite collaborators or helpers to simultaneously edit code with you.

Find out more [about Glitch](https://glitch.com/about).


[Glitch]: https://glitch.com/ "Glitch main site"
[Github]: https://github.com/xbfld/slack-slasher "Github repo for this project"

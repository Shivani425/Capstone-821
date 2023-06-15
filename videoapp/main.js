//#1
let client = AgoraRTC.createClient({mode:'rtc', codec:"vp8"})

let config = {
    appid:'d6e1285c54e645018faf93ca744a18e2',
    token:'007eJxTYNiQ4jI5z2ONvHD/t6Adj4O6X/tNPGOX/6tF+fN+zV0vfxkoMKSYpRoaWZgmm5qkmpmYGhhapCWmWRonJ5qbmCQaWqQaVfB1pTQEMjIcOz2LlZEBAkF8boaczLLU4pKi1MRcQwYGALtEI/Q=',
    uid:null,
    channel:'livestream1',
}

//#2 - Setting tracks for when user joins
let localTracks = {
    audioTrack:null,
    videoTrack:null,
}

let localTrackState = {
    audioTrackMuted:false,
    videoTrackMuted:false,
}


//#3 - Set remote tracks to store other users
let remoteTracks = {};

document.getElementById("join-btn").addEventListener('click', async ()=> {
    //event.target.disabled = true; // Disable the button to prevent multiple clicks
    console.log('User Joined');
    await joinStreams();
    document.getElementById('join-btn').style.display = 'none'
    document.getElementById('footer').style.display = 'flex'
})

document.getElementById('mic-btn').addEventListener('click', async()=> {
    //Check if what the state of muted currently is
    //Disable button
    if(!localTrackState.audioTrackMuted){
        //Mute your audio
        await localTracks.audioTrack.setMuted(true);
        localTrackState.audioTrackMuted = true
        document.getElementById('mic-btn').style.backgroundColor ='rgb(255, 80, 80, 0.7)'
    }else{
        await localTracks.audioTrack.setMuted(false)
        localTrackState.audioTrackMuted = false
        document.getElementById('mic-btn').style.backgroundColor ='#1f1f1f8e'

    }

})


document.getElementById('camera-btn').addEventListener('click', async () => {
    //Check if what the state of muted currently is
    //Disable button
    if(!localTrackState.videoTrackMuted){
        //Mute your audio
        await localTracks.videoTrack.setMuted(true);
        localTrackState.videoTrackMuted = true
        document.getElementById('camera-btn').style.backgroundColor ='rgb(255, 80, 80, 0.7)'
    }else{
        await localTracks.videoTrack.setMuted(false)
        localTrackState.videoTrackMuted = false
        document.getElementById('camera-btn').style.backgroundColor ='#1f1f1f8e'

    }

})






document.getElementById('leave-btn').addEventListener('click', async()=> {
    for(trackName in localTracks){
        let track = localTracks[trackName]
        if(track){
            //stops camera and mic
            track.stop()

            track.close()
            localTracks[trackName] = null
        }
    }
    //leave the channel
    await client.leave()
    document.getElementById('footer').style.display = 'none'
    document.getElementById('user-streams').innerHTML = ''
    document.getElementById('join-btn').style.display = 'block'
})

let joinStreams = async () => {
    
    client.on("user-published", handleUserJoined);
    client.on("user-left", handleUserLeft);


    [config.uid, localTracks.audioTrack, localTracks.videoTrack] = await  Promise.all([
        client.join(config.appid, config.channel, config.token || null, config.uid || null),
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack()

    ]);


    let videoPlayer = `<div class="video-containers" id="video-wrapper-${config.uid}">
                             <p class="user-uid"><img class="volume-icon" id="volume-${config.uid}" src="./assets/volume-on.svg" /> ${config.uid}</p>
                             <div class="video-player player" id="stream-${config.uid}"></div>
    
                        </div>`

    document.getElementById('user-streams').insertAdjacentHTML('beforeend', videoPlayer);
   
    localTracks.videoTrack.play(`stream-${config.uid}`);

    await client.publish([localTracks.audioTrack, localTracks.videoTrack])

    //client.on("user-published", handleUserJoined)

}

let handleUserLeft = async (user) => {
    delete remoteTracks[user.uid]
    document.getElementById(`video-wrapper-${user.uid}`)
    console.log('User has left')
}

let handleUserJoined = async (user, mediaType) => {
    console.log('User has join our stream')
    remoteTracks[user.uid] = user

    await client.subscribe(user, mediaType)

    let videoPlayer = document.getElementById(`video-wrapper-${user.uid}`)
    if(videoPlayer != null){
        videoPlayer.remove()
    }



    if (mediaType === 'video'){

        let videoPlayer = `<div class="video-containers" id="video-wrapper-${user.uid}">
                              <p class="user-uid"><img class="volume-icon" id="volume-${user.uid}" src="./assets/volume-on.svg" /> ${config.uid}</p>
                              <div class="video-player player" id="stream-${user.uid}"></div>
    
                            </div>`

        document.getElementById('user-streams').insertAdjacentHTML('beforeend', videoPlayer);
   
        user.videoTrack.play(`stream-${user.uid}`);



    }

    if (mediaType === 'audio'){
        user.audioTrack.play()
    }
    



}


### Examples

#### Most basic example:

```
<script type="text/javascript">
    new AudioPlayer(
      {
        src: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/355309/Swing_Jazz_Drum.mp3',
        songName: 'Castillo en la niebla (2016)',
        by: 'Alexander Leon',
        address: 'GA5JWS65L22GL5EJROI7NDRPJUPY4TFEKSRDPO2DKLA7MJXRJSTDNKRN',
        memo: 'f',
        idTarget: 'castillo'
      })
</script>
<div id="castillo"></div> 
```

## Core
### Options

src `String` `required`

The source of the audio track to be loaded (URL or base64 data URI). 

songName `string` `required`

The song's name.

by `string` `required`

The author of the song.

address `string` `required`

The stellar _public_ address to which you'd like to receive funds.

memo `string` `required`

A short phrase of your choosing. This helps us determine and display how many people have supported you and what the total value is.
In our eyes, you'd either want to have a unique memo value per song or album.

idTarget `string` `required`

The id of the DOM element you wish to convert into a widget.

message `string` `required`

Note for potential supporters.

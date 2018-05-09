### Examples

#### Most basic example:

```
<script type="text/javascript">
  new AudioPlayer(
    {
        tracks: [
            {
                url: 'https://dl.dropbox.com/s/cv0gaegc6smd642/fantasia_tmp.mp3?dl=0',
                name: 'castillo en la niebla'
            }
        ],
        by: 'Alexander Leon',
        walletAddress: 'GA5JWS65L22GL5EJROI7NDRPJUPY4TFEKSRDPO2DKLA7MJXRJSTDNKRN',
        memo: 'f',
        albumName: 'Castillo en la niebla (2016)',
        idTarget: 'castillo',
        message: 'Thanks!'
    }); 
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

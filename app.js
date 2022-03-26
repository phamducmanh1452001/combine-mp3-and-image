const http = require('http'),
    formidable = require('formidable'),
    fs = require('fs'),
    express = require('express');

const app = express();
const cmd = require('node-cmd');

app.post('/fileupload', (req, res) => {
    const form = new formidable.IncomingForm();
    form
        .parse(req, function (err, fields, files) {
            const mp3OldPath = files.mp3.filepath;
            const mp3Path = `${__dirname}/sound.mp3`;

            fs.rename(mp3OldPath, mp3Path, (err) => {
                if (err) throw err;
                const imageOldPath = files.img.filepath;
                const ans = files.img.originalFilename.split('.');
                const extension = ans[ans.length - 1];
                const imagePath = `${__dirname}/image.${extension}`;

                fs.rename(imageOldPath, imagePath, (err) => {
                    if (err) throw err;
                    console.log('COMMAND: ');
                    const command = `ffmpeg -loop 1 -i ${imagePath} -i ${mp3Path} -c:v libx264 -c:a aac -strict experimental -b:a 192k -shortest output.mp4`;
                    console.log(command);

                    cmd.runSync('rm output.mp4');

                    cmd.run(
                        command,
                        (err, data, stderr) => {
                            console.log(`
                                Sync Err ${err}
                                Sync stderr:  ${stderr}
                                Sync Data ${data}
                            `);

                            res.sendFile(__dirname + '/output.mp4');
                        }
                        
                    );
                });
            });
        }
    );
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

http.createServer(app).listen(8080);
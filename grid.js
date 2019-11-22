const fs = require('fs');
const { spawnSync } = require('child_process');

const directoryWithPics = './Year2000';
const numPicsPerRow = 25;

const findAllFiles = dir => {
  var results = [];
  var list = fs.readdirSync(dir);
  list.forEach((file) => {
      file = dir + '/' + file;
      var stat = fs.statSync(file);
      if (stat && stat.isDirectory()) { 
          results = results.concat(findAllFiles(file));
      } else { 
          if (file.endsWith('.jpg')) results.push(file);
      }
  });
  return results;
}

const files = findAllFiles(directoryWithPics);

console.log(`Generating rows with ${numPicsPerRow} photos each for ${files.length} total photos`);

let i = 0;
while (i < files.length) {
  const lastPicInRow = i + numPicsPerRow < files.length 
    ? i + numPicsPerRow 
    : files.length - 1;
  const filesInRow = files.slice(i,lastPicInRow);
  const rowNum = String(i/numPicsPerRow).padStart(4, '0');
  const args = [...filesInRow, '+append', `row${rowNum}.jpg`];
  console.log(`Generating row ${rowNum+1}`);
  spawnSync('magick', args);
  i += numPicsPerRow;
}

console.log('finished with rows, combining into grid...');
spawnSync('magick', ['row*.jpg', '-append', `grid${numPicsPerRow}_per_row.jpg`]);

const fs = require('fs');
const { execSync } = require('child_process');
const shortid = require('shortid');
 
const directoryWithPics = './photos';
const numPicsPerRow = 50;
const resolutionInGrid = '640x480';
const gridID = shortid.generate();

const findAllPhotos = dir => {
  var results = [];
  var list = fs.readdirSync(dir);
  list.forEach((file) => {
      file = dir + '/' + file;
      var stat = fs.statSync(file);
      if (stat && stat.isDirectory()) { 
          results = results.concat(findAllPhotos(file));
      } else { 
          if (file.toLowerCase().endsWith('.jpg')) {
            results.push(file);
          } else {
            console.log(`Skipping ${file}`);
          }
      }
  });
  return results;
}

const photosArray = findAllPhotos(directoryWithPics);

console.log(`Starting script with id ${gridID} to avoid name conflicts.`)
console.log(`Generating ${Math.ceil(photosArray.length/numPicsPerRow)} rows with max ${numPicsPerRow} photos each for ${photosArray.length} total photos...`);

let i = 0;
while (i < photosArray.length) {
  const photosInRow = photosArray.slice(i, i + numPicsPerRow);
  const photosInRowWithNewResolution = photosInRow.map(filename => `'${filename}[${resolutionInGrid}]'`);
  const rowNum = String(i/numPicsPerRow).padStart(3, '0');
  const args = [...photosInRowWithNewResolution, '+append', `grid_${gridID}_row_${rowNum}.jpg`];
  console.log(`Generating row ${rowNum}`);
  execSync(`magick ${args.join(' ')}`);
  i += numPicsPerRow;
}

console.log('Finished with rows, combining into grid...');
spawnSync('magick', [`grid_${gridID}_row_*.jpg`, '-append', `grid_${gridID}_${numPicsPerRow}_per_row.jpg`]);
console.log('Done.')
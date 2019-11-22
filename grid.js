const fs = require('fs');
const { execSync } = require('child_process');
const shortid = require('shortid');
 
const directoryWithPics = './photos';
const numPicsPerRow = 50;
const resolutionInGrid = '640x480';
const gridID = shortid.generate();
const gridDirectory = `./grid_${gridID}`;

const findAllPhotos = dir => {
  var results = [];
  var list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = dir + '/' + file;
    var stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      console.log(`Searching ${file}`)
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

console.log(`Starting script with id ${gridID} to avoid name conflicts. Creating directory ${gridDirectory} for new files.`);
fs.mkdirSync(gridDirectory);

console.log('Finding all photos...');
const photosArray = findAllPhotos(directoryWithPics);

console.log(`Generating ${Math.ceil(photosArray.length/numPicsPerRow)} rows with max ${numPicsPerRow} photos each for ${photosArray.length} total photos...`);

let i = 0;
while (i < photosArray.length) {
  const photosInRow = photosArray.slice(i, i + numPicsPerRow);
  const photosInRowWithNewResolution = photosInRow.map(filename => `'${filename}[${resolutionInGrid}]'`);
  const rowNum = String(i/numPicsPerRow).padStart(3, '0');
  const args = [...photosInRowWithNewResolution, '+append', `${gridDirectory}/row_${rowNum}.jpg`];
  console.log(`Generating row ${rowNum} of ${Math.ceil(photosArray.length/numPicsPerRow)}...`);
  execSync(`magick ${args.join(' ')}`);
  i += numPicsPerRow;
}

console.log('Finished with rows, combining into grid...');
const args = [`${gridDirectory}/row_*.jpg`, '-append', `${gridDirectory}/grid_with_${numPicsPerRow}_per_row.jpg`];
execSync(`magick ${args.join(' ')}`);
console.log('Done.')
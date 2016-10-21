'use strict'

const express = require('express')
const router = express.Router()
const pexec = require('@naiveroboticist/pexec')
const fs = require('fs')

//
// Return the current time as the number of seconds
// since the epoch.
//
function now () {
  return Math.ceil((new Date).getTime() / 1000)
}

// 
// Parse the specified date string andreturn the
// time as the number of seconds past the epoch.
// 
function epochTime(timeString) {
  return Math.ceil((new Date(timeString)).getTime() / 1000)
}

// Subtract the specified number of hourse from the
// current time and return the time
// 
function hoursAgo(numHours) {
  return now() - (numHours * 60 * 60)
}

router.get('/', function(req, res, next) {
  res.render('images', { title: 'Images' })
})

router.get('/image', function(req, res, next) {
  // First, we need to generate the PNG of the graph we want from the
  // RRD file
  let numHours = parseInt(req.query.hours)
  let measure = req.query.measure
  let fname = '/tmp/' + measure + '-' + numHours + '.png'

  // pexec.pexec('rrdtool graph /tmp/light.png --start ' + epochTime('2016-09-30T09:00:00') + ' --end ' + now() + ' --lower-limit 0 DEF:light=readings.rrd:inside-light:AVERAGE LINE1:light#0000FF:Light')
  let cmd = 'rrdtool graph ' + fname + ' --start ' + hoursAgo(numHours) + ' --end ' + now() + ' --lower-limit 0 DEF:value=readings.rrd:' + measure + ':AVERAGE LINE1:value#0000FF:' + measure
  console.log('The command: %s', cmd)
  pexec.pexec(cmd)
    .then(() => {
      fs.readFile(fname, function(err, buffer) {
        if (err) return res.negotiate(err)
        res.contentType('image/png')
        res.send(buffer)
      })
    })
    .catch((err) => {
      console.err(err)
      res.negotiate(err)
    })
})

module.exports = router

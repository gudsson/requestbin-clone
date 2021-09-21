const binsRouter = require('express').Router()
const Bin = require('../models/bin')

const generateId = (size) => {
  const arr = new Array(size).fill(0)
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return arr.map(val => chars[Math.floor(Math.random() * chars.length - 1)]).join('')
}

const isIdUnique = async(binId) => {
  return Bin.find({ binId })
    .then(bins => {
      return !bins.length
    })
}

binsRouter.get('/', async (req, res, next) => { // DONE
  let binId = generateId(8)

  while (!(await isIdUnique(binId))) {
    binId = generateId(8)
  }

  const bin = new Bin({
    binId,
    requests: []
  })

  bin.save()
    .then(savedBin => {
      res.json(savedBin)
    })
    .catch(error => next(error))
})

binsRouter.get('/inspect/:id', (req, res, next) => {
  const binId = req.params.id
  Bin.findOne({ binId }).then(bin => {
    res.json(bin)
  })
})

binsRouter.all('/:id', (req, res, next) => {
  const binId = req.params.id
  console.log(req.method)
  let reqObj = {
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    path: req.path,
    method: req.method,
    fromIP: req.ip,
    fromIPs: req.ips,
    headers: {},
    body: {},
    createdAt: new Date()
  }

  Bin.findOneAndUpdate({ binId: binId },  {$push: { requests: { request: reqObj } }}, { new: true } )
    .then( bin => {
      const MAX_LEN = 20
      if (bin && bin.requests.length > MAX_LEN) {
        bin.requests[bin.requests.length - MAX_LEN - 1].request.isActive = false
        bin.save()
      }
      res.json({ "ip_address": reqObj.fromIP })
      // res.json(bin)
    })
    .catch(error => next(error))
})

module.exports = binsRouter
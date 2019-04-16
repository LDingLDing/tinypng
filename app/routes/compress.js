import Router from 'koa-router';
import compress from '../controllers/compress';

const router = Router({
  prefix: '/compress'
});

router.get('/', compress.index);

// for require auto in index.js
module.exports = router;
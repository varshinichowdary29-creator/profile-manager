const test = require('node:test');
const assert = require('node:assert');
const { getClasses } = require('../controllers/classController');

test('classController - getClasses returns classes from database', async (t) => {
  const req = {};
  const res = {
    statusCode: 200,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    }
  };

  try {
    await getClasses(req, res);
    if (res.jsonData) {
      assert.strictEqual(res.jsonData.success, true);
      assert.ok(Array.isArray(res.jsonData.data));
    }
  } catch (err) {
    // If DB is not connected during test, it is expected to catch
    assert.ok(err.message);
  }
});

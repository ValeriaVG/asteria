const { Test, expect } = tinyJest;
const test = new Test('Example test')
test.it('works', () => {
    expect(1 + 1).toBe(2)
})
export default test
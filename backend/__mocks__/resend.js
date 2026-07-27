const sendMock = jest.fn().mockResolvedValue({
  data: { id: 'mock-resend-email-id-12345' },
  error: null
});

class Resend {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.emails = {
      send: sendMock
    };
  }
}

module.exports = {
  Resend,
  sendMock
};

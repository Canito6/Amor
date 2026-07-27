const sendMailMock = jest.fn().mockResolvedValue({
  messageId: 'mock-message-id-12345',
  response: '250 OK'
});

const createTransportMock = jest.fn().mockReturnValue({
  sendMail: sendMailMock
});

module.exports = {
  createTransport: createTransportMock,
  sendMail: sendMailMock
};

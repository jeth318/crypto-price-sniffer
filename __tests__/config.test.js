import dotenv from 'dotenv';
import path from 'path';
import process from 'process';
import config from '../src/config';

describe('config', () => {
  it('should call dotenv.config with correct arguments', async () => {
    const pathStub = jest
      .spyOn(path, 'join')
      .mockImplementation(() => 'mockJoin');
    const processStub = jest
      .spyOn(process, 'cwd')
      .mockImplementation(() => 'cwd');
    config.init();
    expect(dotenv.config).toHaveBeenCalledWith({ path: 'mockJoin' });
    expect(pathStub).toHaveBeenCalledWith('cwd', '.env');
    expect(pathStub).toHaveBeenCalledWith('cwd', '.env');
    expect(processStub).toHaveBeenCalledTimes(1);
  });
});

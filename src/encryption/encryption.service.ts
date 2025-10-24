import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly tagLength = 16; // 128 bits

  async generateEncryptionKey(): Promise<string> {
    return crypto.randomBytes(this.keyLength).toString('hex');
  }

  async encryptMessage(message: string, key?: string): Promise<string> {
    const encryptionKey = key ? Buffer.from(key, 'hex') : crypto.randomBytes(this.keyLength);
    const iv = crypto.randomBytes(this.ivLength);
    
    const cipher = crypto.createCipher(this.algorithm, encryptionKey);
    cipher.setAAD(Buffer.from('message-auth', 'utf8'));
    
    let encrypted = cipher.update(message, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine IV, tag, and encrypted data
    const result = iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
    
    return result;
  }

  async decryptMessage(encryptedMessage: string, key: string): Promise<string> {
    const [ivHex, tagHex, encrypted] = encryptedMessage.split(':');
    
    const encryptionKey = Buffer.from(key, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    const decipher = crypto.createDecipher(this.algorithm, encryptionKey);
    decipher.setAAD(Buffer.from('message-auth', 'utf8'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  async generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    return { publicKey, privateKey };
  }

  async encryptWithPublicKey(data: string, publicKey: string): Promise<string> {
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(data, 'utf8')
    );

    return encrypted.toString('base64');
  }

  async decryptWithPrivateKey(encryptedData: string, privateKey: string): Promise<string> {
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(encryptedData, 'base64')
    );

    return decrypted.toString('utf8');
  }

  async generateHash(data: string): Promise<string> {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  async verifySignature(data: string, signature: string, publicKey: string): Promise<boolean> {
    const verifier = crypto.createVerify('sha256');
    verifier.update(data);
    return verifier.verify(publicKey, signature, 'hex');
  }

  async createSignature(data: string, privateKey: string): Promise<string> {
    const signer = crypto.createSign('sha256');
    signer.update(data);
    return signer.sign(privateKey, 'hex');
  }
}
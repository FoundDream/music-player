// 安装依赖：npm install axios crypto-js big-integer
import axios from 'axios';
import bigInt from 'big-integer';
import CryptoJS from 'crypto-js';

// AES + RSA 加密参数
const pubKey = '010001';
const modulus =
  '00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7'; // 网易云 weapi 公共 modulus
const nonce = '0CoJUm6Qyw8W8jud';
const iv = '0102030405060708';

// 随机生成 16 位字符串
function randomString(len) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let str = '';
  for (let i = 0; i < len; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
}

// AES 加密
function aesEncrypt(text, secKey) {
  const enc = CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(secKey), {
    iv: CryptoJS.enc.Utf8.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return enc.toString();
}

// RSA 加密
function rsaEncrypt(secKey) {
  const reversed = secKey.split('').reverse().join('');
  const hex = Buffer.from(reversed).toString('hex');
  const biText = bigInt(hex, 16);
  const biEx = bigInt(pubKey, 16);
  const biMod = bigInt(modulus, 16);
  const biRet = biText.modPow(biEx, biMod);
  return biRet.toString(16).padStart(256, '0');
}

// 生成 params 和 encSecKey
function weapi(data) {
  const text = JSON.stringify(data);
  const secKey = randomString(16);
  const encText = aesEncrypt(aesEncrypt(text, nonce), secKey);
  const encSecKey = rsaEncrypt(secKey);
  return { params: encText, encSecKey };
}

// 调用歌词接口
async function getLyric(songId) {
  const { params, encSecKey } = weapi({ id: songId, lv: -1, tv: -1 });
  try {
    const res = await axios.post(
      'https://music.163.com/weapi/song/lyric?csrf_token=',
      `params=${encodeURIComponent(params)}&encSecKey=${encodeURIComponent(encSecKey)}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          Referer: 'https://music.163.com/',
        },
      },
    );
    console.log(res.data);
  } catch (err) {
    console.error('请求失败:', err.message);
  }
}

// 测试
getLyric(2147712523); // 替换成你想抓的歌曲ID

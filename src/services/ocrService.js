/**
 * OCRサービス
 * 化粧品販売管理アプリ - VSCode版
 *
 * Google Cloud Vision APIを使用した画像テキスト認識
 */

// LocalStorageキー
const API_KEY_STORAGE_KEY = 'cosmetics_vision_api_key';

/**
 * Google Vision APIキーを取得
 * @returns {string|null}
 */
export const getApiKey = () => {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
};

/**
 * Google Vision APIキーを保存
 * @param {string} apiKey
 */
export const setApiKey = (apiKey) => {
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
};

/**
 * Google Vision APIキーを削除
 */
export const clearApiKey = () => {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
};

/**
 * APIキーが設定されているか確認
 * @returns {boolean}
 */
export const hasApiKey = () => {
  const key = getApiKey();
  return key !== null && key.length > 0;
};

/**
 * 画像をOCR処理してテキストを抽出
 * @param {string} imageDataUrl - Base64エンコードされた画像データURL (data:image/jpeg;base64,...)
 * @returns {Promise<OCRResult>}
 */
export const processImageOCR = async (imageDataUrl) => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('API_KEY_NOT_SET');
  }

  // data:image/jpeg;base64,... から base64部分を抽出
  const base64Data = imageDataUrl.split(',')[1];

  if (!base64Data) {
    throw new Error('INVALID_IMAGE_DATA');
  }

  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{
            image: {
              content: base64Data
            },
            features: [
              { type: 'DOCUMENT_TEXT_DETECTION' },
              { type: 'TEXT_DETECTION' }
            ],
            imageContext: {
              languageHints: ['ja', 'en']
            }
          }]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Vision API Error:', errorData);

      if (response.status === 400) {
        throw new Error('INVALID_REQUEST');
      } else if (response.status === 401 || response.status === 403) {
        throw new Error('INVALID_API_KEY');
      } else if (response.status === 429) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      } else {
        throw new Error(`API_ERROR_${response.status}`);
      }
    }

    const result = await response.json();
    return parseOCRResponse(result);
  } catch (error) {
    if (error.message.startsWith('API_') || error.message === 'INVALID_API_KEY' || error.message === 'RATE_LIMIT_EXCEEDED') {
      throw error;
    }
    console.error('OCR processing failed:', error);
    throw new Error('NETWORK_ERROR');
  }
};

/**
 * OCRレスポンスをパース
 * @param {Object} response - Google Vision APIレスポンス
 * @returns {OCRResult}
 */
const parseOCRResponse = (response) => {
  const textAnnotations = response.responses?.[0]?.textAnnotations || [];
  const fullTextAnnotation = response.responses?.[0]?.fullTextAnnotation;

  // フルテキスト
  const fullText = textAnnotations[0]?.description || '';

  // 行に分割
  const lines = fullText.split('\n').filter(line => line.trim());

  // 個別のテキストブロック（位置情報付き）
  const blocks = textAnnotations.slice(1).map(annotation => ({
    text: annotation.description,
    boundingBox: annotation.boundingPoly?.vertices || []
  }));

  // 段落単位のテキスト（より構造化された情報）
  const paragraphs = [];
  if (fullTextAnnotation?.pages) {
    fullTextAnnotation.pages.forEach(page => {
      page.blocks?.forEach(block => {
        block.paragraphs?.forEach(paragraph => {
          const paragraphText = paragraph.words?.map(word =>
            word.symbols?.map(symbol => symbol.text).join('')
          ).join(' ') || '';
          if (paragraphText.trim()) {
            paragraphs.push(paragraphText);
          }
        });
      });
    });
  }

  return {
    fullText,
    lines,
    blocks,
    paragraphs,
    raw: response
  };
};

/**
 * OCRエラーメッセージを取得
 * @param {Error} error
 * @returns {string}
 */
export const getOCRErrorMessage = (error) => {
  const errorMessages = {
    'API_KEY_NOT_SET': 'APIキーが設定されていません。データ管理画面でGoogle Vision APIキーを設定してください。',
    'INVALID_API_KEY': 'APIキーが無効です。正しいキーを設定してください。',
    'INVALID_IMAGE_DATA': '画像データが無効です。別の画像をお試しください。',
    'INVALID_REQUEST': 'リクエストが無効です。画像形式を確認してください。',
    'RATE_LIMIT_EXCEEDED': 'API使用制限に達しました。しばらく待ってからお試しください。',
    'NETWORK_ERROR': 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
  };

  return errorMessages[error.message] || `エラーが発生しました: ${error.message}`;
};

/**
 * @typedef {Object} OCRResult
 * @property {string} fullText - 全テキスト
 * @property {string[]} lines - 行単位のテキスト配列
 * @property {Array<{text: string, boundingBox: Array}>} blocks - テキストブロック（位置情報付き）
 * @property {string[]} paragraphs - 段落単位のテキスト
 * @property {Object} raw - 生のAPIレスポンス
 */

/** ====== */
import probe from 'probe-image-size';
import React from 'react';
// const probe = require('probe-image-size');

async function Image(props) {
  const { src, alt, title } = props;
  let imageInfo = { width: undefined, height: undefined };
  if (src.startsWith('http')) {
    imageInfo = await probe(src);
  }
  if (src.startsWith('data:image/')) {
    const base64 = src.split(',')[1];
    const buffer = Buffer.from(base64, 'base64');
    imageInfo = probe.sync(buffer);
  }
  const { width, height } = imageInfo;
  return (
    <React.Fragment>
      <img src={src} alt={alt} title={title} />
      <em style={{ marginLeft: '8px' }}>image dimension is ({width} x {height})</em>
    </React.Fragment>
  );
}

export default Image;
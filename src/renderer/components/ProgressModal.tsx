// @ts-nocheck

import { Progress, Modal } from 'antd';

export default function ProgressModal(params) {
  const { show,percent } = params;
  const twoColors = { '0%': '#108ee9', '100%': '#87d068' };
  return (
    <>
      <Modal
      closeIcon={null}
       footer={null}
        title="压缩进度"
        open={show}
        // onOk={handleOk}
        // onCancel={handleCancel}
      >
        <Progress percent={percent} strokeColor={twoColors} />
      </Modal>
    </>
  );
}

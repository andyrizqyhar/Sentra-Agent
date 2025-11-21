import React, { useMemo, useState } from 'react';
import styles from './UpdateDialog.module.css';

export type UpdateOptions = {
  mode: 'safe' | 'force';
  scope: 'root' | 'all';
  install: 'none' | 'node' | 'python' | 'all';
  pm: 'auto' | 'pnpm' | 'npm' | 'cnpm';
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (opts: UpdateOptions) => void;
}

export const UpdateDialog: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const [mode, setMode] = useState<'safe' | 'force'>('safe');
  const [scope, setScope] = useState<'root' | 'all'>('all');
  const [install, setInstall] = useState<'none' | 'node' | 'python' | 'all'>('node');
  const [pm, setPm] = useState<'auto' | 'pnpm' | 'npm' | 'cnpm'>('auto');

  const preview = useMemo(() => {
    return `node scripts/update.mjs --mode ${mode} --scope ${scope} --install ${install} --pm ${pm}`;
  }, [mode, scope, install, pm]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>自动更新</div>
          <div className={styles.subtitle}>更新根目录仓库并可选安装依赖</div>
        </div>
        <div className={styles.body}>
          <div className={styles.row}>
            <div className={styles.label}>更新模式</div>
            <div className={styles.segment} role="tablist" aria-label="更新模式">
              <button className={`${styles.segBtn} ${mode === 'safe' ? ' ' + styles.active : ''}`} onClick={() => setMode('safe')}>安全</button>
              <button className={`${styles.segBtn} ${mode === 'force' ? ' ' + styles.active : ''}`} onClick={() => setMode('force')}>强制</button>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.label}>作用范围</div>
            <div className={styles.segment} role="tablist" aria-label="作用范围">
              <button className={`${styles.segBtn} ${scope === 'root' ? ' ' + styles.active : ''}`} onClick={() => setScope('root')}>仅根目录</button>
              <button className={`${styles.segBtn} ${scope === 'all' ? ' ' + styles.active : ''}`} onClick={() => setScope('all')}>全部</button>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.label}>依赖安装</div>
            <div className={styles.segment} role="tablist" aria-label="依赖安装">
              <button className={`${styles.segBtn} ${install === 'none' ? ' ' + styles.active : ''}`} onClick={() => setInstall('none')}>不安装</button>
              <button className={`${styles.segBtn} ${install === 'node' ? ' ' + styles.active : ''}`} onClick={() => setInstall('node')}>Node</button>
              <button className={`${styles.segBtn} ${install === 'python' ? ' ' + styles.active : ''}`} onClick={() => setInstall('python')}>Python</button>
              <button className={`${styles.segBtn} ${install === 'all' ? ' ' + styles.active : ''}`} onClick={() => setInstall('all')}>全部</button>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.label}>包管理器</div>
            <div className={styles.segment} role="tablist" aria-label="包管理器">
              <button className={`${styles.segBtn} ${pm === 'auto' ? ' ' + styles.active : ''}`} onClick={() => setPm('auto')}>自动</button>
              <button className={`${styles.segBtn} ${pm === 'pnpm' ? ' ' + styles.active : ''}`} onClick={() => setPm('pnpm')}>pnpm</button>
              <button className={`${styles.segBtn} ${pm === 'npm' ? ' ' + styles.active : ''}`} onClick={() => setPm('npm')}>npm</button>
              <button className={`${styles.segBtn} ${pm === 'cnpm' ? ' ' + styles.active : ''}`} onClick={() => setPm('cnpm')}>cnpm</button>
            </div>
          </div>

          {mode === 'force' && (
            <div className={styles.warning}>
              <div>注意：强制更新将执行 reset --hard 和 clean -fdx，可能丢弃未提交改动。</div>
            </div>
          )}

          <div className={styles.preview}>{preview}</div>
        </div>
        <div className={styles.footer}>
          <button className={`${styles.btn} ${styles.cancel}`} onClick={onClose}>取消</button>
          <button className={`${styles.btn} ${styles.confirm} ${mode === 'force' ? styles.danger : ''}`} onClick={() => onSubmit({ mode, scope, install, pm })}>开始更新</button>
        </div>
      </div>
    </div>
  );
};

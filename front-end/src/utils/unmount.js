export default function unmount(mountedRef, componentName = '') {
  return () => {
    if (componentName) console.log(`${componentName} is unmounting...`);
    mountedRef.current = false;
  };
}

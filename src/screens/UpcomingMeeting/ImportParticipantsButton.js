import { Button } from 'react-bootstrap'
import { useRef } from 'react'
import { toast } from 'react-toastify';

export default function ImportParticipantsButton({ handleFile }) {
  const fileRef = useRef(null);

  function handleChange(event) {
    console.log('fired');
    const file = event.target.files[0];
    try {
      handleFile(file);
    } catch (error) {
      toast.error(error.message);
    }
  }
  
  return (
    <>
      <Button
        className="d-grid gap-2 Text--no-decoration"
        onClick={() => fileRef.current.click()}
        block="true"
      >
        Import Participants From CSV File
      </Button>
      <input
        type="file"
        hidden
        ref={fileRef}
        onChange={handleChange}
        accept=".csv"
      />
    </>
  );
}

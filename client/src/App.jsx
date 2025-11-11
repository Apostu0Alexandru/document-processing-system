import DisplayDocument from "./components/DisplayDocument";
import FileUpload from "./components/FileUpload";

export default function App() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Document Processing System</h1>
      <DisplayDocument />
      <FileUpload />
    </div>
  );
}

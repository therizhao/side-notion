import styled from 'styled-components';
import Editor from './editor';

const Container = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  justify-content: space-between;

  .left {
    width: 50%;

    .video {
      width: 100%;
      height: 100%;
    }
  }

  .right {
    width: 50vw;
    display: block;
    overflow: hidden;
  }
`;

const Youtube = () => (
  <iframe
    title="Youtube"
    src="https://www.youtube.com/embed/A03oI0znAoc?enablejsapi=1"
    className="video"
    scrolling="no"
    style={{ overflow: 'hidden' }}
  />
);

function App() {
  return (
    <Container>
      <div className="left">
        <Youtube />
      </div>
      <div className="right">
        <Editor />
      </div>
    </Container>
  );
}

export default App;

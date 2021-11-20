import React from 'react';
import styled from 'styled-components';
import EditablePage from './ui/components/editablePage';

const Container = styled.div`
  width: 100%;
  max-width: 720px;
  padding: 1rem 0 1rem 1rem;
  margin: 0;
`;

const Editor = () => (
  <Container>
    <EditablePage
      id="1"
      fetchedBlocks={[
        {
          _id: '61946cd4a3395e58f38d6d84',
          tag: 'h1',
          html: 'f',
          imageUrl: '',
        },
      ]}
    />
  </Container>
);

export default Editor;

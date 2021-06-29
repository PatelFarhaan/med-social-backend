import { useRecords } from 'admin-bro'
import axios from 'axios'
import React from 'react'
import styled from 'styled-components'

const ApproveUser = styled.button`
  color: #fff;
  padding: 0.8rem;
  font-size: 14px;
  text-transform: uppercase;
  border-radius: 4px;
  font-weight: 400;
  display: block;
  width: 40%;
  cursor: pointer;
  border: 1px solid rgba(61, 143, 68, 1);
  background: #3d8f44;
  &:hover {
    background-color: rgba(61, 143, 68, 0.9);
  }
  margin-bottom: 20px;
  justify-self: flex-end;
`

const Delete = styled.button`
  color: #3d8f44;
  padding: 0.8rem;
  font-size: 14px;
  text-transform: uppercase;
  border-radius: 4px;
  font-weight: 400;
  display: block;
  width: 50%;
  cursor: pointer;
  border: 1px solid rgba(61, 143, 68, 1);
  background: transparent;
  &:hover {
    background-color: rgba(255, 255, 255, 0.75);
  }
`

const Left = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
`

const Post = styled.button`
  color: #fff;
  padding: 0.8rem;
  font-size: 14px;
  text-transform: uppercase;
  border-radius: 4px;
  font-weight: 400;
  display: block;
  width: 50%;
  cursor: pointer;
  border: none;
  background: #3d8f44;
  &:hover {
    background-color: rgba(61, 143, 68, 0.9);
  }
`
const Select = styled.div`
  margin-bottom: 10px;
  select {
    height: 20px;
  }
`
const Right = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
`

const ButtonBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const CardText = styled.p`
  color: #000;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1.25rem;
  font-weight: 400;
`

const CardTitle = styled.h2`
  color: #000;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: capitalize;
  margin: 0px;
`

const CardContent = styled.div`
  padding: 1rem;
`

const CardImage = styled.img`
  height: auto;
  max-width: 40%;
  vertical-align: middle;
`

const Card = styled.div`
  border: 1px solid rgba(61, 143, 68, 1);

  background: #fdfbf7;
  a {
    color: #f9f9f9;
    text-decoration: none;
  }
  border-radius: 0.25rem;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  margin-bottom: 20px;
  width: auto;
`

const CardContainer = styled.li`
  a {
    color: #f9f9f9;
    text-decoration: none;
  }
  display: flex;
  flex-direction: column;
  padding: 1rem;
  justify-content: space-between;
  width: auto;
`

const Container = styled.ul`
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 0;
`

const Layout = styled.div`
  /* max-width: 1200px; */
  margin: 0 auto;
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    background-color: #ecf9ff;
  }

  body {
    color: #272727;
    font-family: 'Quicksand', serif;
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0;
    padding: 1rem;
  }
`
const ViewPostsComponent = props => {
  const { records } = useRecords(props.resource.id)

  const approveUser = async username => {
    const response = await axios.get(`http://localhost:3005/admin/api/resources/PseudoUser/records/${username}/approveUser`)
    console.log(response.data)
    // eslint-disable-next-line no-undef
    window.location.reload(false)
  }

  const deleteUser = async id => {
    const response = await axios.get(`http://localhost:3005/admin/api/resources/PseudoPost/records/${id}/delete`)
    console.log(response.data)
    // eslint-disable-next-line no-undef
    window.location.reload(false)
  }

  const changeSelect = e => {
    console.log(e.target.value)
  }

  return (
    <Layout>
      <Container>
        <CardContainer>
          <ApproveUser onClick={() => approveUser(records[0]?.params.username)}>Approve User</ApproveUser>
          {records &&
            records.map((record, key) => (
              <Card key={key}>
                {/* <CardImage src="https://picsum.photos/500/300/?image=10" /> */}
                <CardContent>
                  <CardTitle>{record.params.username}</CardTitle>
                  <CardText>{record.params.tweet}</CardText>
                  <ButtonBar>
                    <Left>
                      <Delete onClick={() => deleteUser(record?.params.id)}>Delete</Delete>
                    </Left>
                    <Right>
                      <Select>
                        <select defaultValue="default" onChange={changeSelect}>
                          <option value="default" disabled>
                            Choose where to post
                          </option>
                          <option value="column">Column</option>
                          <option value="square">Square</option>
                        </select>
                      </Select>
                      <Post> Post </Post>
                    </Right>
                  </ButtonBar>
                </CardContent>
              </Card>
            ))}
        </CardContainer>
      </Container>
    </Layout>
  )
}

export default ViewPostsComponent

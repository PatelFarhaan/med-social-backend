import { Layout, Container, Image, Bio, Header, Content, Name } from './ProfileStyles'

const Profile = props => {
  const { bio, username, backgroundImage } = props.record.params

  console.log(props.record.params)

  return (
    <Layout>
      <Container>
        <Image
        // puser twitter image too small, therefore, commenting it out and using a hardcoded image src
        >
          <img src={backgroundImage} alt={`${username}_avatar`} />
        </Image>
        <Name>
          <Header>Username:</Header>
          <Content type="text" defaultValue={username} disabled />
        </Name>
        <Bio>
          <Header>Bio:</Header>
          <Content type="text" defaultValue={bio} disabled />
        </Bio>
      </Container>
    </Layout>
  )
}

export default Profile

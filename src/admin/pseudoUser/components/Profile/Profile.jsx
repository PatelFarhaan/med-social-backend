import { Layout, Container, Image, Bio, Header, Content, Name } from './ProfileStyles'

const Profile = props => {
  const { bio, username, profileImageUrl } = props.record.params

  console.log(props.record.params)

  return (
    <Layout>
      <Container>
        <Image>
          <img src={profileImageUrl.replace('_normal', '')} alt={`${username}_avatar`} />
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

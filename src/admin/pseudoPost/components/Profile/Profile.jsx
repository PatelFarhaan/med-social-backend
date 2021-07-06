import { useEffect, useState } from 'react'
import axios from 'axios'
import { Layout, Container, Image, Bio, Expertises, Header, Content, ExpertiseContent, Select, Save, Name } from './ProfileStyles'

const Profile = props => {
  const [user, setUser] = useState(0)
  const [expertises, setExpertises] = useState([])
  const [userExp, setUserExp] = useState(0)
  const [edit, setEdit] = useState(false)
  const [bio, setBio] = useState(0)
  const [username, setUsername] = useState(0)

  useEffect(
    () => {
      setUser(props.record.params)
      setBio(props.record.params.bio)
      setUsername(props.record.params.username)
    },
    [props]
  )

  useEffect(() => {
    const getExpertises = async () => {
      const response = await axios.get(`${props.action.custom.baseUrl}/admin/api/resources/Expertise/actions/list`)
      setExpertises(response.data.records)
    }

    getExpertises()
  }, [])

  const save = async () => {
    const formData = new FormData()
    formData.set('bio', bio)
    formData.set('username', username)
    formData.set('ExpertiseId', userExp)
    await axios.post(`${props.action.custom.baseUrl}/admin/api/resources/PseudoUserExpertise/actions/new`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }

  const changeDropDown = e => {
    e.preventDefault()
    setUserExp(e.target.value)
  }

  return (
    <Layout>
      <Container>
        <Image
          // puser twitter image too small, therefore, commenting it out and using a hardcoded image src
          // src={username.profile_image_url}
          src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
          alt={`${username}_avatar`}
        />
        <Name>
          <Header>Username:</Header>
          <Content disabled={true} type="text" defaultValue={username} focus={edit} onChange={e => setUsername(e.target.value)} />
        </Name>
        <Bio>
          <Header>Bio:</Header>
          <Content disabled={!edit} type="text" defaultValue={bio} focus={edit} onChange={e => setBio(e.target.value)} />
        </Bio>
        <Expertises>
          <Header>Expertise:</Header>
          <ExpertiseContent>
            {expertises && expertises?.map((expertise, i) => <div key={i}>{`${expertise.params.name}\n`}</div>)}
          </ExpertiseContent>
        </Expertises>
        {edit ? <Save onClick={() => save()}>Save</Save> : <Save onClick={() => setEdit(true)}>Edit</Save>}
      </Container>
    </Layout>
  )
}

export default Profile

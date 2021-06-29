const ListPpostComponent = props => (
  <div>
    <img src={props.record.params.backgroundImage} />
    <img src={props.record.params.profileImageUrl} />
    <div>{props.record.params.username}</div>
    <div>{props.record.params.bio}</div>
  </div>
)

export default ListPpostComponent

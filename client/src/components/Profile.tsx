import RichText from "./RichText";
import Arrow12 from "./Arrow12";
import Attachments from "./Attachments";

import Profile_image_1 from "@assets/Profile image 1.jpg";

interface ProfileProps {
  cv: {
    general: {
      profilePhoto: string;
      displayName: string;
      byline: string;
      website?: string;
      about?: string;
    };
    allCollections: Array<{
      name: string;
      items: any[];
    }>;
  };
}

const Profile: React.FC<ProfileProps> = ({ cv }) => {
  return (
    <div className="profile">
      <div className="profile-header">
        <div className="profile-photo">
          <img 
            src={Profile_image_1} 
            alt="" 
            width={92} 
            height={92} 
          />
        </div>
        <div className="profile-info">
          <h1>{cv.general.displayName}</h1>
          <div className="byline">{cv.general.byline}</div>
        </div>
      </div>
      {cv.general.about && (
        <section className="profile-section about">
          <h3>About</h3>
          <div className="description">
            <RichText text={cv.general.about} />
          </div>
        </section>
      )}
      {cv.allCollections.map((collection, index) => (
        <section key={collection.name} className="profile-section">
          <h3>{collection.name}</h3>
          <div className="contacts">
            {collection.items.map((experience, itemIndex) => {
              if (collection.name === "Contact") {
                return <ContactItem key={experience.id || itemIndex} experience={experience} />;
              }
              return <ProfileItem key={experience.id || itemIndex} experience={experience} />;
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

interface ProfileItemProps {
  experience: {
    heading: string;
    url?: string;
    year: string;
    location?: string;
    description?: string;
    attachments?: any[];
  };
}

const ProfileItem: React.FC<ProfileItemProps> = ({ experience }) => {
  let title;
  if (experience.url) {
    title = (
      <>
        <a href={experience.url} target="_blank" rel="noopener noreferrer">
          {experience.heading}
        </a>
        <span className="link-arrow">
          {'\ufeff'}
          <Arrow12 fill="var(--grey1)" />
        </span>
      </>
    );
  } else {
    title = experience.heading;
  }

  return (
    <div className="experience">
      <div className="year">
        <span>{experience.year}</span>
      </div>
      <div className="experience-content">
        <div className="title">{title}</div>
        {experience.location && (
          <div className="location">{experience.location}</div>
        )}
        {experience.description && (
          <div className="description">
            <RichText text={experience.description} />
          </div>
        )}
        {experience.attachments && experience.attachments.length > 0 && (
          <Attachments attachments={experience.attachments} />
        )}
      </div>
    </div>
  );
};

interface ContactItemProps {
  experience: {
    platform: string;
    handle: string;
    url: string;
  };
}

const ContactItem: React.FC<ContactItemProps> = ({ experience }) => {
  return (
    <div className="experience">
      <div className="year">
        <span>{experience.platform}</span>
      </div>
      <div className="experience-content">
        <div className="title">
          <a href={experience.url} target="_blank" rel="noopener noreferrer">
            {experience.handle}
          </a>
          <span className="link-arrow">
            {'\ufeff'}
            <Arrow12 />
          </span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
